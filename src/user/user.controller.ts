import {
  Controller,
  Get,
  Put,
  Body,
  UseGuards,
  Req,
  UploadedFiles,
  UseInterceptors,
  Query,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { UserService } from './user.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { RequestWithUser } from '../types/request-with-user';
import { SearchCoachDto } from './dto/search-coach.dto';
import { multerOptions } from 'src/utils/multer.utils';

@ApiTags('user')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Put('profile')
  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'profilePicture', maxCount: 1 },
        { name: 'bannerPicture', maxCount: 1 },
      ],
      multerOptions,
    ),
  )
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update profile' })
  @ApiResponse({ status: 200, description: 'Profile updated successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async updateProfile(
    @Req() req: RequestWithUser,
    @Body() updateProfileDto: UpdateProfileDto,
    @UploadedFiles()
    files: {
      profilePicture?: Express.Multer.File[];
      bannerPicture?: Express.Multer.File[];
    },
  ) {
    if (files.profilePicture && files.profilePicture[0]) {
      updateProfileDto.profilePicture = files.profilePicture[0].filename;
    }
    if (files.bannerPicture && files.bannerPicture[0]) {
      updateProfileDto.bannerPicture = files.bannerPicture[0].filename;
    }
    return this.userService.updateProfile(req.user.id, updateProfileDto);
  }

  @Get('profile')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get profile' })
  @ApiResponse({ status: 200, description: 'Profile retrieved successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async getProfile(@Req() req: RequestWithUser) {
    return this.userService.getProfile(req.user.id);
  }

  @Get('search-coaches')
  @ApiOperation({ summary: 'Search coaches based on criteria' })
  @ApiResponse({ status: 200, description: 'Coaches retrieved successfully' })
  async searchCoaches(@Query() searchCoachDto: SearchCoachDto) {
    return this.userService.searchCoaches(searchCoachDto);
  }
}