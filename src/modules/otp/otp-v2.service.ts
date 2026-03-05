import crypto from 'crypto';
import { redisClient } from "../../helpers/redis/redis";
import ApiError from '../../errors/ApiError';
import { StatusCodes } from 'http-status-codes';
import bcryptjs from 'bcryptjs';


export class OtpV2WithRedis{
    OTP_TTL = 600; // 10 minute .. 
    OTP_COOLDOWN_TTL = 60; // 1 minute between resend
    OTP_SEND_LIMIT = 3 // max send per hour 
    OTP_MAX_ATTEMPTS = 5 // max verify attempts
    
    constructor(){

    }

    generateOTP = () => {
        return crypto.randomInt(100000, 999999).toString();
    }

    async sendVerificationOtp (email: string): Promise<void> {

        // 1.  cooldown check - prevent spam click
        const cooldown = await redisClient.get(`otp:cooldown:${email}`);
        if(cooldown) throw new ApiError(StatusCodes.TOO_MANY_REQUESTS, 'Please wait 60s before requesting another OTP')
            
        // 2. hourly send limit
        const sendCount = await redisClient.get(`otp:send_count:${email}`);
        if(sendCount && parseInt(sendCount) >= this.OTP_SEND_LIMIT){
            throw new ApiError(StatusCodes.TOO_MANY_REQUESTS, 'Max OTP send limit reached. Try again in an hour.')
        }

        // 3. generate otp and hash it
        const otp = this.generateOTP();
        const hashed = await bcryptjs.hash(otp, 10);

        // store in redis automatically
        const pipeline = redisClient.pipeline();

        pipeline.set(`otp:verify:${email}`, JSON.stringify({ hash: hashed, attempts: 0 }), 'EX', this.OTP_TTL);
        pipeline.set(`otp:cooldown:${email}`, '1', 'EX', this.OTP_COOLDOWN_TTL);
        pipeline.incr(`otp:send_count:${email}`);
        pipeline.expire(`otp:send_count:${email}`, 3600);
        
        await pipeline.exec();

        // 5. Queue email - never send synchronously

        // TODO : Queue email
    } 

    async verifyOtp (email: string, inputOtp: string): Promise<boolean> {

        // get otp from redis 
        const raw = await redisClient.get(`otp:verify:${email}`);
        if(!raw) throw new ApiError(StatusCodes.BAD_REQUEST, 'OTP expired or not found')

        const data : { hash : string; attempts:number} = JSON.parse(raw);

        if (data.attempts >= this.OTP_MAX_ATTEMPTS) {
            await redisClient.del(`otp:verify:${email}`);
            throw new ApiError(StatusCodes.TOO_MANY_REQUESTS, 'Too many failed attempts. Request a new OTP.');
        }

        const isValid = await bcryptjs.compare(inputOtp, data.hash);

        if(!isValid){
            data.attempts++;

            // update attemps count -- keep same TTL
            const ttl = await redisClient.ttl(`otp:verify:${email}`);
            await redisClient.set(`otp:verify:${email}`, JSON.stringify(data), 'EX', ttl)
            throw new ApiError(StatusCodes.BAD_REQUEST, `Invalid OTP. ${this.OTP_MAX_ATTEMPTS - data.attempts} attempts remaining`);
        }

        // cleanup on success
        await redisClient.del(`otp:verify:${email}`);

        return true;
    }
}

/* --------------------------
export async function createOTP(key: string) {
  const code = randomInt(100000, 999999).toString();

  await redis.set(
    key,
    JSON.stringify({ code, attempts: 0 }),
    'EX',
    300
  );

  return code;
}


async storeOTP(email: string, otp: string): Promise<void> {
    const key = `${authConfig.redis.otpPrefix}${email}`;
    await this.client.setex(
      key, 
      authConfig.otp.expiresIn, 
      JSON.stringify({
        otp,
        attempts: 0,
        createdAt: new Date().toISOString()
      })
    );
  }


export async function verifyOTP(key: string, input: string) {
  const data = await redis.get(key);
  if (!data) throw new Error('OTP expired');

  const parsed = JSON.parse(data);

  if (parsed.code !== input) {
    parsed.attempts++;
    await redis.set(key, JSON.stringify(parsed), 'KEEPTTL');
    throw new Error('Invalid OTP');
  }

  await redis.del(key);
}

----------------------------*/