import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './dialog'

describe('DialogContent', () => {
  it('renderiza o botão de fechar acessível "Fechar" por padrão', () => {
    render(
      <Dialog open>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar ação</DialogTitle>
            <DialogDescription>Descrição do diálogo.</DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    )

    const closeButton = screen.getByRole('button', { name: 'Fechar' })
    expect(closeButton).toBeInTheDocument()
    expect(closeButton).toBeEnabled()
  })

  it('desabilita o botão de fechar quando closeDisabled={true}', () => {
    render(
      <Dialog open>
        <DialogContent closeDisabled>
          <DialogHeader>
            <DialogTitle>Alterar senha</DialogTitle>
            <DialogDescription>Aguarde o envio.</DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    )

    expect(screen.getByRole('button', { name: 'Fechar' })).toBeDisabled()
  })

  it('omite o botão de fechar quando hideCloseButton={true}', () => {
    render(
      <Dialog open>
        <DialogContent hideCloseButton>
          <DialogHeader>
            <DialogTitle>Visualizador</DialogTitle>
            <DialogDescription>Sem botão padrão.</DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    )

    expect(
      screen.queryByRole('button', { name: 'Fechar' })
    ).not.toBeInTheDocument()
  })

  it('omite o botão de fechar quando showCloseButton={false}', () => {
    render(
      <Dialog open>
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>Sem fechar</DialogTitle>
            <DialogDescription>Ação obrigatória.</DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    )

    expect(
      screen.queryByRole('button', { name: 'Fechar' })
    ).not.toBeInTheDocument()
  })
})
