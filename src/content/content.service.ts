import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Content } from './entities/content.entity';
import { CreateContentDto } from './dto/create-content.dto';
import { UpdateContentDto } from './dto/update-content.dto';
import { User } from '../auth/entities/user.entity';

@Injectable()
export class ContentService {
  constructor(
    @InjectRepository(Content)
    private readonly contentRepository: Repository<Content>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(createContentDto: CreateContentDto, userId: number) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const content = this.contentRepository.create({
      ...createContentDto,
      user,
    });

    await this.contentRepository.save(content);
    return content;
  }

  async findAll() {
    return this.contentRepository.find();
  }

  async findOne(id: number) {
    const content = await this.contentRepository.findOne({ where: { id } });
    if (!content) {
      throw new NotFoundException(`Content with ID ${id} not found`);
    }
    return content;
  }

  async update(id: number, updateContentDto: UpdateContentDto) {
    const content = await this.contentRepository.preload({
      id,
      ...updateContentDto,
    });
    if (!content) {
      throw new NotFoundException(`Content with ID ${id} not found`);
    }
    return this.contentRepository.save(content);
  }

  async remove(id: number) {
    const content = await this.findOne(id);
    return this.contentRepository.remove(content);
  }
}