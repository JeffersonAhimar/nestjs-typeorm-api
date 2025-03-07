import { BadRequestException, HttpStatus, Injectable } from '@nestjs/common';
import { User } from 'src/users/entities/user.entity';
import * as XLSX from 'xlsx';
import * as moment from 'moment';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class ExcelService {
  constructor(private usersService: UsersService) {}
  async handleBulkUserUpload(file: Express.Multer.File) {
    if (!file) {
      throw new Error('No file uploaded');
    }

    // read XLSX file
    const workbook = XLSX.read(file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    const data: any[] = XLSX.utils.sheet_to_json(worksheet);
    // data.forEach((row) => console.log(row.email));

    // validate & clean data
    const cleanedData = data.map((row, index) => {
      const cleanedRow = this.validateAndTransformRow(row, index + 2);
      return cleanedRow;
    });

    type UserResponse = Partial<User> & {
      rowIndex: number;
      errorMessage?: string;
    };
    const createdUsers: UserResponse[] = [];
    const failedUsers: UserResponse[] = [];

    // create users
    for (const [index, user] of cleanedData.entries()) {
      try {
        const userCreated = await this.usersService.create(user);
        if (userCreated) {
          createdUsers.push({ ...user, rowIndex: index + 2 });
        }
      } catch (error) {
        let errorMessage = 'Error while uploading user.';
        if (error.driverError.message) {
          errorMessage = error.driverError.message;
        }
        failedUsers.push({ ...user, rowIndex: index + 2, errorMessage });
      }
    }

    // response
    if (failedUsers.length > 0) {
      return {
        statusCode: HttpStatus.PARTIAL_CONTENT,
        message: 'Some users could not be created',
        errors: failedUsers.map(({ rowIndex, errorMessage }) => ({
          rowIndex,
          errorMessage,
        })),
      };
    }
    return {
      statusCode: HttpStatus.CREATED,
      message: 'All users were created successfully',
    };
  }

  private validateAndTransformRow(row: User, rowIndex: number) {
    if (
      !row.name ||
      !row.email ||
      !row.password ||
      !row.identityNumber ||
      !row.dateOfBirth
    ) {
      throw new BadRequestException(`Missing info in row ${rowIndex}`);
    }

    return {
      name: this.capitalizeWords(row.name.trim()),
      email: this.validateEmail(row.email.trim(), rowIndex),
      password: row.password ? row.password.trim() : '',
      identityNumber: this.validateLength(
        String(row.identityNumber).trim(),
        rowIndex,
        8,
      ),
      dateOfBirth: this.validateDate(row.dateOfBirth, rowIndex),
    };
  }

  private capitalizeWords(text: string) {
    return text
      .split(' ')
      .map(
        (word) =>
          word.charAt(0).toUpperCase() + word.slice(1).toLocaleLowerCase(),
      )
      .join(' ');
  }

  private validateEmail(email: string, rowIndex: number) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new BadRequestException(
        `The email at row ${rowIndex} is not valid`,
      );
    }
    return email;
  }

  private validateLength(text: string, rowIndex: number, textLength: number) {
    if (text.length != textLength || !/^\d+$/.test(text)) {
      throw new BadRequestException(
        `The ID ${text} in row ${rowIndex} must have ${textLength} digits`,
      );
    }
    return text;
  }

  private validateDate(date: Date, rowIndex: number) {
    if (!moment(date, 'YYYY-MM-DD', true).isValid()) {
      throw new BadRequestException(
        `The date at row ${rowIndex} is not valid. Use format YYYY-MM-DD.`,
      );
    }
    return date;
  }
}
