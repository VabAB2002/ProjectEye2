import { Request, Response, NextFunction } from 'express';
import { FinancialService } from '../../core/services/financial.service';
import { asyncHandler } from '../middlewares/error.middleware';

export class FinancialController {
  static createTransaction = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const { projectId } = req.params;
      const receiptFile = req.file as Express.Multer.File | undefined;
      
      const transaction = await FinancialService.createTransaction(
        projectId,
        req.body,
        req.user!.userId,
        receiptFile
      );

      res.status(201).json({
        success: true,
        data: { transaction },
      });
    }
  );

  static updateTransaction = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const { projectId, transactionId } = req.params;
      
      const transaction = await FinancialService.updateTransaction(
        transactionId,
        projectId,
        req.body
      );

      res.json({
        success: true,
        data: { transaction },
      });
    }
  );

  static approveTransaction = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const { projectId, transactionId } = req.params;
      
      const transaction = await FinancialService.approveTransaction(
        transactionId,
        projectId,
        req.body,
        req.user!.userId
      );

      res.json({
        success: true,
        data: { transaction },
      });
    }
  );

  static getTransaction = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const { projectId, transactionId } = req.params;
      
      const transaction = await FinancialService.getTransaction(
        transactionId,
        projectId
      );

      res.json({
        success: true,
        data: { transaction },
      });
    }
  );

  static listTransactions = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const { projectId } = req.params;
      const {
        type,
        approvalStatus,
        category,
        minAmount,
        maxAmount,
        startDate,
        endDate,
        page = '1',
        limit = '10',
      } = req.query;
      
      const result = await FinancialService.listTransactions(
        projectId,
        {
          type: type as any,
          approvalStatus: approvalStatus as any,
          category: category as string,
          minAmount: minAmount ? parseFloat(minAmount as string) : undefined,
          maxAmount: maxAmount ? parseFloat(maxAmount as string) : undefined,
          startDate: startDate ? new Date(startDate as string) : undefined,
          endDate: endDate ? new Date(endDate as string) : undefined,
        },
        parseInt(page as string),
        parseInt(limit as string)
      );

      res.json({
        success: true,
        data: result,
      });
    }
  );

  static getFinancialSummary = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const { projectId } = req.params;
      
      const summary = await FinancialService.getFinancialSummary(projectId);

      res.json({
        success: true,
        data: { summary },
      });
    }
  );

  static deleteTransaction = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const { projectId, transactionId } = req.params;
      
      await FinancialService.deleteTransaction(transactionId, projectId);

      res.json({
        success: true,
        message: 'Transaction deleted successfully',
      });
    }
  );
}