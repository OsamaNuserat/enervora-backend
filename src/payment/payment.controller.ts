import { Controller, Get, Post, Body, Param, UseGuards, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { PaymentService } from './payment.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { RequestWithUser } from '../types/request-with-user';

@ApiTags('payments')
@Controller('payments')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create payment' })
  @ApiResponse({ status: 201, description: 'Payment created successfully' })
  async create(@Req() req: RequestWithUser, @Body() createPaymentDto: CreatePaymentDto) {
    return this.paymentService.create(createPaymentDto, req.user.id);
  }

  @Get()
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all payments' })
  @ApiResponse({ status: 200, description: 'Payments retrieved successfully' })
  async findAll() {
    return this.paymentService.findAll();
  }

  @Get(':id')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get payment by ID' })
  @ApiResponse({ status: 200, description: 'Payment retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Payment not found' })
  async findOne(@Param('id') id: string) {
    return this.paymentService.findOne(+id);
  }
}