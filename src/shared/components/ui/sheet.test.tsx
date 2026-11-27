import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from './sheet'

describe('SheetContent', () => {
  it('permite sobrescrever altura no side="bottom" sem manter h-auto ou prefixo data-[side=bottom]', () => {
    render(
      <Sheet open>
        <SheetContent side="bottom" className="h-[92dvh] rounded-t-3xl">
          <SheetHeader>
            <SheetTitle>Nova conta</SheetTitle>
            <SheetDescription>Folha inferior no mobile.</SheetDescription>
          </SheetHeader>
        </SheetContent>
      </Sheet>
    )

    const content = screen.getByRole('dialog')
    expect(content).toHaveAttribute('data-side', 'bottom')
    expect(content).toHaveClass('h-[92dvh]', 'rounded-t-3xl')
    expect(content).not.toHaveClass('h-auto')
    expect(content.className).not.toContain('data-[side=bottom]:h-auto')
  })

  it('permite sobrescrever largura no side="right" sem manter w-3/4, sm:max-w-sm ou prefixos data-[side=right]', () => {
    render(
      <Sheet open>
        <SheetContent side="right" className="w-full sm:max-w-xl">
          <SheetHeader>
            <SheetTitle>Nova categoria</SheetTitle>
            <SheetDescription>Folha lateral no desktop.</SheetDescription>
          </SheetHeader>
        </SheetContent>
      </Sheet>
    )

    const content = screen.getByRole('dialog')
    expect(content).toHaveAttribute('data-side', 'right')
    expect(content).toHaveClass('w-full', 'sm:max-w-xl')
    expect(content).not.toHaveClass('w-3/4', 'sm:max-w-sm')
    expect(content.className).not.toContain('data-[side=right]:w-3/4')
    expect(content.className).not.toContain('data-[side=right]:sm:max-w-sm')
  })

  it('renderiza o botão "Fechar" quando showCloseButton={true}', () => {
    render(
      <Sheet open>
        <SheetContent showCloseButton>
          <SheetHeader>
            <SheetTitle>Detalhes</SheetTitle>
            <SheetDescription>Painel com botão de fechar.</SheetDescription>
          </SheetHeader>
        </SheetContent>
      </Sheet>
    )

    const closeButton = screen.getByRole('button', { name: 'Fechar' })
    expect(closeButton).toBeInTheDocument()
    expect(closeButton).toBeEnabled()
  })

  it('omite o botão "Fechar" quando showCloseButton={false}', () => {
    render(
      <Sheet open>
        <SheetContent showCloseButton={false}>
          <SheetHeader>
            <SheetTitle>Sem fechar</SheetTitle>
            <SheetDescription>Painel sem botão de fechar.</SheetDescription>
          </SheetHeader>
        </SheetContent>
      </Sheet>
    )

    expect(
      screen.queryByRole('button', { name: 'Fechar' })
    ).not.toBeInTheDocument()
  })
})
