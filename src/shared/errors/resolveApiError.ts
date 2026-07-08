import { API_ERROR_CODES, type ApiErrorCode } from './apiErrorCodes'
import type { ApiErrorContext, ApiErrorPresentation } from './apiError.types'
import {
  getApiErrorCode,
  getApiErrorStatus,
  isApiNetworkError,
  parseApiFieldErrors,
  parsePlatformError,
} from './parseApiError'

type Copy = Pick<ApiErrorPresentation, 'title' | 'description' | 'recovery'>

const codeCopy: Partial<Record<ApiErrorCode, Copy>> = {
  [API_ERROR_CODES.validation]: {
    title: 'Confira os dados informados',
    description: 'Corrija os campos destacados para continuar.',
    recovery: 'correct-fields',
  },
  [API_ERROR_CODES.internalServer]: serviceUnavailable(),
  [API_ERROR_CODES.unauthorized]: sessionEnded(),
  [API_ERROR_CODES.tooManyRequests]: {
    title: 'Muitas tentativas em pouco tempo',
    description: 'Aguarde o bloqueio terminar antes de tentar novamente.',
    recovery: 'retry',
  },
  [API_ERROR_CODES.invalidAccessToken]: sessionEnded(),
  [API_ERROR_CODES.invalidRefreshToken]: sessionEnded(),
  [API_ERROR_CODES.potentialSessionHijacking]: sessionEnded(),
  [API_ERROR_CODES.authProviderAlreadyLinked]: {
    title: 'Método de acesso já vinculado',
    description: 'Este método já está disponível na sua conta.',
    recovery: 'none',
  },
  [API_ERROR_CODES.authProviderLinkedToAnotherUser]: {
    title: 'Método vinculado a outra conta',
    description: 'Use outro método de acesso ou entre na conta já vinculada.',
    recovery: 'none',
  },
  [API_ERROR_CODES.sessionNotFound]: {
    title: 'Sessão não encontrada',
    description: 'Ela pode já ter sido encerrada. Atualize a lista de sessões.',
    recovery: 'retry',
  },
  [API_ERROR_CODES.emailVerificationRequired]: {
    title: 'Confirme seu email para continuar',
    description:
      'Sua sessão está ativa, mas os recursos financeiros ficam bloqueados até a confirmação.',
    recovery: 'none',
  },
  [API_ERROR_CODES.emailVerificationTokenInvalid]: {
    title: 'Este link não pode ser usado',
    description:
      'O link pode estar incompleto, já ter sido usado ou não pertencer a uma verificação válida.',
    recovery: 'sign-in',
  },
  [API_ERROR_CODES.emailVerificationTokenExpired]: {
    title: 'Este link expirou',
    description:
      'Por segurança, links de verificação duram 15 minutos. Entre na sua conta e solicite um novo envio.',
    recovery: 'sign-in',
  },
  [API_ERROR_CODES.emailVerificationCooldownActive]: {
    title: 'Aguarde para reenviar',
    description:
      'Um novo email já foi solicitado recentemente. Por segurança, aguarde antes de tentar de novo.',
    recovery: 'none',
  },
  [API_ERROR_CODES.emailVerificationDailyLimitExceeded]: {
    title: 'Limite de envios atingido',
    description:
      'Você já solicitou o número máximo de emails de verificação nas últimas 24 horas. Tente novamente mais tarde.',
    recovery: 'none',
  },
  [API_ERROR_CODES.emailVerificationUserBlocked]: {
    title: 'Esta conta não pode ser verificada agora',
    description:
      'O acesso desta conta está bloqueado. Entre em contato com o suporte para recuperar o acesso.',
    recovery: 'none',
  },
  [API_ERROR_CODES.invalidUsernameFormat]: {
    title: 'Nome de usuário inválido',
    description: 'Revise o nome de usuário e tente novamente.',
    recovery: 'correct-fields',
  },
  [API_ERROR_CODES.avatarFileTooLarge]: avatarTooLarge(),
  [API_ERROR_CODES.payloadTooLarge]: avatarTooLarge(),
  [API_ERROR_CODES.avatarUploadFailed]: {
    title: 'Serviço indisponível no momento',
    description:
      'Não foi possível enviar a foto agora. Tente novamente em instantes.',
    recovery: 'retry',
  },
  [API_ERROR_CODES.invalidAvatarImage]: {
    title: 'Não foi possível ler esta imagem',
    description:
      'Escolha outra foto em JPEG, PNG ou WebP e tente novamente.',
    recovery: 'correct-fields',
  },
  [API_ERROR_CODES.unsupportedAvatarFile]: {
    title: 'Formato de imagem não aceito',
    description: 'Use uma foto em JPEG, PNG ou WebP.',
    recovery: 'correct-fields',
  },
  [API_ERROR_CODES.userEmailAlreadyExists]: {
    title: 'Este email já está em uso',
    description: 'Entre com esse email ou informe outro endereço.',
    recovery: 'correct-fields',
  },
  [API_ERROR_CODES.usernameAlreadyExists]: {
    title: 'Este nome de usuário já existe',
    description: 'Escolha outro nome de usuário para continuar.',
    recovery: 'correct-fields',
  },
  [API_ERROR_CODES.userNotFound]: {
    title: 'Usuário não encontrado',
    description: 'Atualize a página ou entre novamente para continuar.',
    recovery: 'sign-in',
  },
  [API_ERROR_CODES.userUpdateInputVoid]: {
    title: 'Nenhuma alteração para salvar',
    description: 'Altere pelo menos um campo antes de salvar.',
    recovery: 'correct-fields',
  },
  [API_ERROR_CODES.invalidUser]: {
    title: 'Dados do perfil inválidos',
    description: 'Revise os campos destacados e tente novamente.',
    recovery: 'correct-fields',
  },
  [API_ERROR_CODES.accountAlreadyDefault]: {
    title: 'Esta já é a conta padrão',
    description: 'Nenhuma alteração foi necessária.',
    recovery: 'none',
  },
  [API_ERROR_CODES.accountArchived]: archivedAccount(),
  [API_ERROR_CODES.accountArchivedMutation]: archivedAccount(),
  [API_ERROR_CODES.accountCannotBeArchived]: {
    title: 'Esta conta não pode ser arquivada',
    description: 'Defina outra conta como padrão e tente novamente.',
    recovery: 'none',
  },
  [API_ERROR_CODES.accountCannotBeDefault]: {
    title: 'Esta conta não pode ser padrão',
    description: 'Restaure a conta antes de defini-la como padrão.',
    recovery: 'none',
  },
  [API_ERROR_CODES.accountHasScheduledTransactions]: {
    title: 'Existem movimentações agendadas',
    description:
      'Revise as movimentações futuras antes de arquivar esta conta.',
    recovery: 'none',
  },
  [API_ERROR_CODES.accountMustRemainActive]: {
    title: 'Mantenha pelo menos uma conta ativa',
    description: 'Crie ou restaure outra conta antes de arquivar esta.',
    recovery: 'none',
  },
  [API_ERROR_CODES.accountNotArchived]: {
    title: 'Esta conta já está ativa',
    description: 'Atualize a lista para ver o estado mais recente.',
    recovery: 'retry',
  },
  [API_ERROR_CODES.accountNotFound]: {
    title: 'Conta não encontrada',
    description: 'Ela pode ter sido removida ou não estar mais disponível.',
    recovery: 'retry',
  },
  [API_ERROR_CODES.accountUpdateEmpty]: {
    title: 'Nenhuma alteração para salvar',
    description: 'Altere pelo menos um campo da conta antes de salvar.',
    recovery: 'correct-fields',
  },
  [API_ERROR_CODES.invalidAccount]: invalidAccount(),
  [API_ERROR_CODES.invalidAccountName]: invalidAccount(),
  [API_ERROR_CODES.categoryHasTransactions]: {
    title: 'Esta categoria possui lançamentos',
    description:
      'Escolha outra categoria para receber os lançamentos antes de excluir.',
    recovery: 'choose-target',
  },
  [API_ERROR_CODES.categoryInvalidListQuery]: {
    title: 'Não foi possível aplicar estes filtros',
    description: 'Restaure os filtros e tente carregar a lista novamente.',
    recovery: 'retry',
  },
  [API_ERROR_CODES.categoryInvalidMerge]: {
    title: 'Escolha outra categoria de destino',
    description: 'O destino precisa estar ativo e ser do mesmo tipo.',
    recovery: 'choose-target',
  },
  [API_ERROR_CODES.categoryNameAlreadyExists]: {
    title: 'Esta categoria já existe',
    description: 'Use outro nome ou edite a categoria existente.',
    recovery: 'correct-fields',
  },
  [API_ERROR_CODES.categoryNotFound]: {
    title: 'Categoria não encontrada',
    description: 'Ela pode ter sido removida ou não estar mais disponível.',
    recovery: 'retry',
  },
  [API_ERROR_CODES.categoryNotManageable]: {
    title: 'Esta categoria não pode ser alterada',
    description: 'Atualize a lista para verificar o estado atual da categoria.',
    recovery: 'retry',
  },
  [API_ERROR_CODES.categoryUpdateEmpty]: {
    title: 'Nenhuma alteração para salvar',
    description: 'Altere pelo menos um campo da categoria antes de salvar.',
    recovery: 'correct-fields',
  },
  [API_ERROR_CODES.invalidCategory]: {
    title: 'Dados da categoria inválidos',
    description: 'Revise os campos destacados e tente novamente.',
    recovery: 'correct-fields',
  },
  [API_ERROR_CODES.technicalCategoryCannotBeCreated]: {
    title: 'Este tipo de categoria é reservado',
    description: 'Escolha uma categoria de receita, despesa ou investimento.',
    recovery: 'correct-fields',
  },
  [API_ERROR_CODES.invalidTransaction]: {
    title: 'Revise os dados da transação',
    description:
      'Alguma informação não combina com as regras financeiras. Corrija os campos e tente novamente.',
    recovery: 'correct-fields',
  },
  [API_ERROR_CODES.transactionAccountUnavailable]: {
    title: 'Conta indisponível',
    description: 'Escolha uma conta ativa para continuar.',
    recovery: 'correct-fields',
  },
  [API_ERROR_CODES.transactionAlreadyEffective]: {
    title: 'Transação já efetivada',
    description: 'Atualize a lista para ver o estado mais recente.',
    recovery: 'retry',
  },
  [API_ERROR_CODES.transactionCannotDeleteTransfer]: {
    title: 'Transferência não pode ser excluída',
    description:
      'Nesta versão, corrija com uma transferência no sentido contrário.',
    recovery: 'none',
  },
  [API_ERROR_CODES.transactionCategoryIncompatible]: {
    title: 'Categoria incompatível',
    description: 'Use uma categoria do mesmo tipo da transação.',
    recovery: 'correct-fields',
  },
  [API_ERROR_CODES.transactionCategoryUnavailable]: {
    title: 'Categoria indisponível',
    description: 'Escolha uma categoria ativa para este tipo de transação.',
    recovery: 'correct-fields',
  },
  [API_ERROR_CODES.transactionInvalidStateTransition]: {
    title: 'Esta mudança não está disponível',
    description: 'Atualize os dados e tente novamente.',
    recovery: 'retry',
  },
  [API_ERROR_CODES.transactionNotFound]: {
    title: 'Transação não encontrada',
    description: 'Ela pode ter sido excluída ou não estar mais disponível.',
    recovery: 'retry',
  },
  [API_ERROR_CODES.transactionUpdateEmpty]: {
    title: 'Nenhuma alteração para salvar',
    description: 'Altere pelo menos um campo antes de salvar.',
    recovery: 'correct-fields',
  },
}

const contextFallbacks: Record<ApiErrorContext, Copy> = {
  'auth.sign-in': {
    title: 'Não foi possível entrar',
    description: 'Confira seu email e senha e tente novamente.',
    recovery: 'correct-fields',
  },
  'auth.sign-up': {
    title: 'Não foi possível criar sua conta',
    description: 'Revise os dados informados e tente novamente.',
    recovery: 'correct-fields',
  },
  'auth.email-verification.confirm': {
    title: 'Não foi possível confirmar seu email',
    description:
      'Confira se o link está completo e tente novamente. Se ele expirou, solicite um novo envio.',
    recovery: 'retry',
  },
  'auth.email-verification.resend': {
    title: 'Não foi possível reenviar o email',
    description:
      'Sua sessão continua ativa. Aguarde um momento e tente novamente.',
    recovery: 'retry',
  },
  'auth.link-email': {
    title: 'Não foi possível vincular email e senha',
    description: 'Revise os dados informados e tente novamente.',
    recovery: 'correct-fields',
  },
  'auth.link-google': {
    title: 'Não foi possível vincular o Google',
    description: 'Tente novamente ou mantenha seu método de acesso atual.',
    recovery: 'retry',
  },
  'auth.sessions.list': loadFailure('as sessões'),
  'auth.sessions.revoke': {
    title: 'Não foi possível encerrar a sessão',
    description: 'Atualize a lista e tente novamente.',
    recovery: 'retry',
  },
  'user.avatar.remove': actionFailure('remover a foto de perfil'),
  'user.avatar.update': {
    title: 'Não foi possível atualizar a foto',
    description:
      'Ajuste a imagem ou tente outra foto. Sua foto atual foi preservada.',
    recovery: 'correct-fields',
  },
  'user.profile.update': {
    title: 'Não foi possível salvar o perfil',
    description:
      'Seus dados continuam nesta tela. Revise os campos e tente novamente.',
    recovery: 'correct-fields',
  },
  'user.username.availability': {
    title: 'Não foi possível verificar o usuário',
    description: 'Aguarde um momento e tente verificar novamente.',
    recovery: 'retry',
  },
  'user.username.update': {
    title: 'Não foi possível alterar o usuário',
    description:
      'O nome informado foi preservado. Revise o campo e tente novamente.',
    recovery: 'correct-fields',
  },
  'accounts.list': loadFailure('suas contas'),
  'accounts.summary': loadFailure('o resumo de saldos'),
  'accounts.create': saveFailure('criar a conta'),
  'accounts.update': saveFailure('salvar as alterações da conta'),
  'accounts.archive': actionFailure('arquivar esta conta'),
  'accounts.unarchive': actionFailure('restaurar esta conta'),
  'accounts.set-default': actionFailure('definir esta conta como padrão'),
  'categories.list': loadFailure('as categorias'),
  'categories.metadata': loadFailure('as opções de cor e ícone'),
  'categories.create': saveFailure('criar a categoria'),
  'categories.update': saveFailure('salvar as alterações da categoria'),
  'categories.archive': actionFailure('arquivar esta categoria'),
  'categories.unarchive': actionFailure('restaurar esta categoria'),
  'categories.delete': actionFailure('excluir esta categoria'),
  'categories.merge-delete': actionFailure(
    'mover os lançamentos e excluir a categoria'
  ),
  'transactions.list': loadFailure('as transações'),
  'transactions.detail': loadFailure('os detalhes da transação'),
  'transactions.create': saveFailure('criar a transação'),
  'transactions.update': saveFailure('salvar as alterações da transação'),
  'transactions.confirm': actionFailure('efetivar esta transação'),
  'transactions.delete': actionFailure('excluir esta transação'),
  generic: serviceUnavailable(),
}

export const resolveApiError = (
  error: unknown,
  context: ApiErrorContext = 'generic'
): ApiErrorPresentation => {
  const platformError = parsePlatformError(error)
  const statusCode = getApiErrorStatus(error)
  const code = getApiErrorCode(error)
  const fieldErrors = parseApiFieldErrors(platformError)
  const isNetworkError = isApiNetworkError(error)

  const copy = resolveCopy(code, statusCode, context, isNetworkError)

  return {
    code,
    statusCode,
    fieldErrors,
    isNetworkError,
    ...copy,
  }
}

const resolveCopy = (
  code: string | null,
  statusCode: number | null,
  context: ApiErrorContext,
  isNetworkError: boolean
): Copy => {
  if (
    context === 'auth.sign-in' &&
    (code === API_ERROR_CODES.unauthorized || statusCode === 401)
  ) {
    return contextFallbacks[context]
  }

  return (
    (code ? codeCopy[code as ApiErrorCode] : undefined) ??
    resolveStatusFallback(statusCode, context, isNetworkError)
  )
}

const resolveStatusFallback = (
  statusCode: number | null,
  context: ApiErrorContext,
  isNetworkError: boolean
): Copy => {
  if (isNetworkError) {
    return {
      title: 'Sem conexão com o serviço',
      description:
        'Confira sua conexão e tente novamente. Seus dados continuam nesta tela.',
      recovery: 'retry',
    }
  }

  if (statusCode === 401) {
    if (context === 'auth.sign-in') {
      return contextFallbacks[context]
    }

    return sessionEnded()
  }

  if (statusCode === 404) {
    return {
      title: 'Conteúdo não encontrado',
      description:
        'Atualize a página para verificar as informações mais recentes.',
      recovery: 'retry',
    }
  }

  if (statusCode === 409) {
    return {
      title: 'Esta ação não está disponível agora',
      description:
        'O estado atual deste item impede a alteração. Atualize os dados e tente novamente.',
      recovery: 'retry',
    }
  }

  if (statusCode === 429) {
    return {
      title: 'Muitas tentativas em pouco tempo',
      description: 'Aguarde alguns instantes antes de tentar novamente.',
      recovery: 'retry',
    }
  }

  if (statusCode !== null && statusCode >= 500) {
    return serviceUnavailable()
  }

  return contextFallbacks[context]
}

function serviceUnavailable(): Copy {
  return {
    title: 'Serviço indisponível no momento',
    description:
      'Não foi possível concluir esta ação agora. Seus dados continuam nesta tela.',
    recovery: 'retry',
  }
}

function sessionEnded(): Copy {
  return {
    title: 'Sua sessão terminou',
    description: 'Entre novamente para continuar com segurança.',
    recovery: 'sign-in',
  }
}

function archivedAccount(): Copy {
  return {
    title: 'Esta conta está arquivada',
    description: 'Restaure a conta antes de fazer alterações.',
    recovery: 'none',
  }
}

function invalidAccount(): Copy {
  return {
    title: 'Dados da conta inválidos',
    description: 'Revise os campos destacados e tente novamente.',
    recovery: 'correct-fields',
  }
}

function avatarTooLarge(): Copy {
  return {
    title: 'Imagem muito grande',
    description: 'Escolha uma foto de até 5 MB para continuar.',
    recovery: 'correct-fields',
  }
}

function loadFailure(resource: string): Copy {
  return {
    title: `Não foi possível carregar ${resource}`,
    description: 'Confira sua conexão e tente novamente.',
    recovery: 'retry',
  }
}

function saveFailure(action: string): Copy {
  return {
    title: `Não foi possível ${action}`,
    description:
      'Seus dados continuam nesta tela. Revise as informações e tente novamente.',
    recovery: 'retry',
  }
}

function actionFailure(action: string): Copy {
  return {
    title: `Não foi possível ${action}`,
    description: 'Atualize os dados e tente novamente.',
    recovery: 'retry',
  }
}
