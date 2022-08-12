import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { InjectRepository } from "@nestjs/typeorm";
import { ExtractJwt, Strategy } from "passport-jwt";
import { Repository } from "typeorm";
import { User } from "../entities/user.entity";


@Injectable()
export class JwtStratery extends PassportStrategy(Strategy) {
    
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        configService: ConfigService,
    ) {
        super({
            secretOrKey: configService.get('JWT_SECRET'),
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        })
    }

    async validate(payload: any): Promise<User>{
        const { id } = payload;
        const user = await this.userRepository.findOneBy({id});
        // console.log(payload, user)
        if (!user) {
            throw new UnauthorizedException('Token Not Valid');
        }
        if (!user.isActive) {
            throw new UnauthorizedException('This user is not active');
        }
        
        return user;
    }
}