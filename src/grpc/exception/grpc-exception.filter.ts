import {
  Catch,
  ArgumentsHost,
  HttpException,
  RpcExceptionFilter,
} from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { status as Status, ServerErrorResponse } from '@grpc/grpc-js';
import { Observable, throwError } from 'rxjs';

@Catch()
export class GrpcExceptionFilter implements RpcExceptionFilter<RpcException> {
  catch(exception: any, host: ArgumentsHost): Observable<any> {
    console.error(' Erreur interceptée :', exception);
    return throwError(() => {
      //  Si l'exception a une propriété "code", c'est une erreur gRPC
      if (exception.code !== undefined) {
        switch (exception.code) {
          case Status.OK:
            return new RpcException({ code: Status.OK, message: 'Succès' });

          case Status.CANCELLED:
            return new RpcException({
              code: Status.CANCELLED,
              message: 'Requête annulée par le client.',
            });

          case Status.UNKNOWN:
            return new RpcException({
              code: Status.UNKNOWN,
              message: 'Une erreur inconnue est survenue.',
            });

          case Status.INVALID_ARGUMENT:
            return new RpcException({
              code: Status.INVALID_ARGUMENT,
              message: 'Argument invalide dans la requête.',
            });

          case Status.DEADLINE_EXCEEDED:
            return new RpcException({
              code: Status.DEADLINE_EXCEEDED,
              message: 'Le délai de réponse a été dépassé.',
            });

          case Status.NOT_FOUND:
            return new RpcException({
              code: Status.NOT_FOUND,
              message: 'Ressource demandée introuvable.',
            });

          case Status.ALREADY_EXISTS:
            return new RpcException({
              code: Status.ALREADY_EXISTS,
              message: 'Cette ressource existe déjà.',
            });

          case Status.PERMISSION_DENIED:
            return new RpcException({
              code: Status.PERMISSION_DENIED,
              message: 'Permission refusée.',
            });

          case Status.UNAUTHENTICATED:
            return new RpcException({
              code: Status.UNAUTHENTICATED,
              message: 'Authentification requise.',
            });

          case Status.RESOURCE_EXHAUSTED:
            return new RpcException({
              code: Status.RESOURCE_EXHAUSTED,
              message: 'Quota dépassé.',
            });

          case Status.FAILED_PRECONDITION:
            return new RpcException({
              code: Status.FAILED_PRECONDITION,
              message: "État invalide pour l'opération demandée.",
            });

          case Status.ABORTED:
            return new RpcException({
              code: Status.ABORTED,
              message: 'Opération interrompue.',
            });

          case Status.OUT_OF_RANGE:
            return new RpcException({
              code: Status.OUT_OF_RANGE,
              message: 'Valeur en dehors de la plage autorisée.',
            });

          case Status.UNIMPLEMENTED:
            return new RpcException({
              code: Status.UNIMPLEMENTED,
              message: 'Fonctionnalité non implémentée.',
            });

          case Status.INTERNAL:
            return new RpcException({
              code: Status.INTERNAL,
              message: 'Erreur interne du serveur gRPC.',
            });

          case Status.UNAVAILABLE:
            return new RpcException({
              code: Status.UNAVAILABLE,
              message: 'Le service gRPC distant est indisponible.',
            });

          case Status.DATA_LOSS:
            return new RpcException({
              code: Status.DATA_LOSS,
              message: 'Perte de données irrécupérable.',
            });

          default:
            return new RpcException({
              code: Status.UNKNOWN,
              message: exception.message || 'Erreur inconnue',
            });
        }
      }

      //  Gérer les exceptions NestJS courantes (erreurs HTTP converties en gRPC)
      if (exception instanceof HttpException) {
        return new RpcException({
          code: Status.INVALID_ARGUMENT,
          message: exception.message || 'Requête invalide.',
        });
      }

      //  Si l'exception est une erreur standard de JavaScript (TypeError, SyntaxError, etc.)
      if (exception instanceof Error) {
        return new RpcException({
          code: Status.INTERNAL,
          message: exception.message || 'Erreur serveur.',
        });
      }

      //  Si l'erreur contient une propriété "details", utiliser ce message
      if (exception.details) {
        return new RpcException({
          code: Status.INTERNAL,
          message: exception.details,
        });
      }

      //  Erreur par défaut si l'exception ne correspond à aucun cas
      return new RpcException({
        code: Status.INTERNAL,
        message: "Une erreur interne inattendue s'est produite.",
      });
    });
  }
}
