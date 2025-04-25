import { Controller } from '@nestjs/common';
import {
  FiscalYearRequest,
  IsDateWithinFiscalYearRequest,
  FiscalYearServiceControllerMethods,
  FiscalYearResponse,
  IsDateWithinFiscalYearResponse,
  FiscalYearServiceController,
} from '../proto/generated/fiscal-year';
import { Observable } from 'rxjs';
import { FiscalYearService } from 'src/modules/fiscal-year/fiscal-year.service';

@Controller()
@FiscalYearServiceControllerMethods()
export class FiscalYearGrpcApiController
  implements FiscalYearServiceController
{
  constructor(private readonly fiscalYearService: FiscalYearService) {}
  getFiscalYear(
    request: FiscalYearRequest,
  ):
    | Promise<FiscalYearResponse>
    | Observable<FiscalYearResponse>
    | FiscalYearResponse
    | any {
    return this.fiscalYearService.getFiscalYear(request);
  }

  isDateWithinFiscalYear(
    request: IsDateWithinFiscalYearRequest,
  ):
    | Promise<IsDateWithinFiscalYearResponse>
    | Observable<IsDateWithinFiscalYearResponse>
    | IsDateWithinFiscalYearResponse {
    return this.fiscalYearService.isDateWithinFiscalYear(request);
  }
}
