---
applyTo: 'src/features/*/components/**/*.tsx, src/shared/components/**/*.tsx'
description: 'Silicon Valley UX/UI Design Principles - Laws of UX and Nielsen Heuristics for modern web applications'
---

# Silicon Valley Design Principles

Este documento codifica os princípios de UX/UI utilizados pelas empresas líderes do Vale do Silício, baseados em **Laws of UX**, **Nielsen's 10 Usability Heuristics** e **Design Thinking**.

---

## 🎯 Core Philosophy

> "Users spend most of their time on OTHER sites. This means users prefer your site to work the same way as all the other sites they already know."
> — Jakob's Law

**Silicon Valley Design** = **User-Centered + Data-Driven + Iterative**

---

## 📚 10 Usability Heuristics (Nielsen Norman Group)

### 1. Visibility of System Status

**Princípio**: O sistema sempre deve manter os usuários informados sobre o que está acontecendo, com feedback apropriado em tempo razoável.

```typescript
// ✅ CORRETO: Loading states visíveis
export const LoginForm = () => {
  const { mutate, isPending } = useMutation(authService.login);
  
  return (
    <Button disabled={isPending}>
      {isPending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Signing in...
        </>
      ) : (
        'Sign in'
      )}
    </Button>
  );
};

// ❌ ERRADO: Sem feedback de loading
<Button onClick={handleLogin}>Sign in</Button>
```

**Aplicações:**
- Loading spinners em requisições
- Progress bars em uploads
- Toast notifications em ações concluídas
- Skeleton screens durante carregamento inicial

---

### 2. Match Between System and Real World

**Princípio**: Use linguagem familiar ao usuário, não jargões técnicos.

```typescript
// ✅ CORRETO: Linguagem clara e familiar
<Button>Delete Transaction</Button>
<p>Your account balance is R$ 1.234,56</p>

// ❌ ERRADO: Jargão técnico
<Button>Remove Entity</Button>
<p>Balance: 1234.56 BRL</p>
```

**Aplicações:**
- Ícones que representam objetos do mundo real
- Metáforas visuais (carrinho de compras, lixeira)
- Formato de data/moeda do país do usuário
- Termos de negócio, não termos técnicos

---

### 3. User Control and Freedom

**Princípio**: Usuários frequentemente erram. Forneça "saídas de emergência" claras.

```typescript
// ✅ CORRETO: Undo/Cancel sempre disponível
export const DeleteDialog = ({ onDelete, onCancel }) => (
  <AlertDialog>
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
        <AlertDialogDescription>
          This action cannot be undone. This will permanently delete your transaction.
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel onClick={onCancel}>Cancel</AlertDialogCancel>
        <AlertDialogAction onClick={onDelete}>Delete</AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
);

// ❌ ERRADO: Sem opção de cancelar
<button onClick={() => deleteNow()}>Delete</button>
```

**Aplicações:**
- Botões "Cancel" em modais
- Breadcrumbs para navegação
- "Undo" após deletar (como Gmail)
- ESC fecha modais

---

### 4. Consistency and Standards

**Princípio**: Usuários não devem se perguntar se diferentes palavras/ações significam a mesma coisa.

```typescript
// ✅ CORRETO: Consistência em nomenclatura
// Sempre use "Delete" para remoção
<Button variant="destructive">Delete Account</Button>
<Button variant="destructive">Delete Transaction</Button>

// ❌ ERRADO: Termos diferentes para mesma ação
<Button>Delete Account</Button>
<Button>Remove Transaction</Button> // Inconsistente!
<Button>Erase Category</Button>      // Inconsistente!
```

**Aplicações:**
- Cores consistentes (destructive = red)
- Ícones padronizados (trash = delete)
- Posição de botões (confirm à direita)
- Mesmo comportamento entre páginas

---

### 5. Error Prevention

**Princípio**: Melhor que boas mensagens de erro é prevenir erros.

```typescript
// ✅ CORRETO: Validação preventiva
const schema = z.object({
  amount: z.number().positive('Amount must be positive'),
  date: z.date().max(new Date(), 'Date cannot be in the future'),
});

// Disable submit se form inválido
<Button type="submit" disabled={!form.formState.isValid}>
  Save
</Button>

// ❌ ERRADO: Só valida após submit
<Button onClick={() => save(data)}>Save</Button>
```

**Aplicações:**
- Disable botões se ação é inválida
- Validação em tempo real
- Confirmação para ações destrutivas
- Constraints em inputs (`type="number"`, `max`, `min`)

---

### 6. Recognition Rather Than Recall

**Princípio**: Minimize carga de memória. Torne elementos visíveis.

```typescript
// ✅ CORRETO: Mostra opções, não exige memorização
<Select>
  <SelectTrigger>
    <SelectValue placeholder="Select category" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="food">🍔 Food</SelectItem>
    <SelectItem value="transport">🚗 Transport</SelectItem>
    <SelectItem value="health">💊 Health</SelectItem>
  </SelectContent>
</Select>

// ❌ ERRADO: Usuário precisa lembrar IDs
<Input placeholder="Enter category ID" />
```

**Aplicações:**
- Dropdowns ao invés de inputs livres
- Ícones + texto (não só ícones)
- Tooltips em hover
- Breadcrumbs mostram onde está

---

### 7. Flexibility and Efficiency of Use

**Princípio**: Atalhos para usuários experientes, sem atrapalhar novatos.

```typescript
// ✅ CORRETO: Suporta keyboard shortcuts
import { useHotkeys } from 'react-hotkeys-hook';

export const TransactionList = () => {
  useHotkeys('ctrl+n', () => openNewTransactionModal());
  useHotkeys('/', () => focusSearch());
  
  return (
    <>
      <Button onClick={openNewTransactionModal}>
        New Transaction <kbd>Ctrl+N</kbd>
      </Button>
      <SearchInput />
    </>
  );
};
```

**Aplicações:**
- Keyboard shortcuts (Ctrl+S, Ctrl+N)
- Bulk actions (selecionar múltiplos)
- Quick actions menu (Cmd+K)
- Favoritos/Recent items

---

### 8. Aesthetic and Minimalist Design

**Princípio**: Interfaces não devem conter informação irrelevante.

```typescript
// ✅ CORRETO: Informação essencial primeiro
export const TransactionCard = ({ transaction }) => (
  <Card>
    <CardHeader>
      <CardTitle className="text-lg">{transaction.description}</CardTitle>
      <CardDescription>
        <span className="text-2xl font-bold">
          {formatCurrency(transaction.amount)}
        </span>
      </CardDescription>
    </CardHeader>
    <CardContent>
      <p className="text-sm text-muted-foreground">
        {formatDate(transaction.date)}
      </p>
    </CardContent>
  </Card>
);

// ❌ ERRADO: Informação excessiva
<Card>
  <p>ID: {id}</p>
  <p>Created At: {createdAt}</p>
  <p>Updated At: {updatedAt}</p>
  <p>User ID: {userId}</p>
  <p>Status: {status}</p>
  // ... muito info técnico
</Card>
```

**Aplicações:**
- Hierarquia visual clara (tamanhos de fonte)
- Esconder detalhes técnicos
- Progressive disclosure (mostrar mais sob demanda)
- Espaçamento generoso

---

### 9. Help Users Recognize, Diagnose, and Recover from Errors

**Princípio**: Mensagens de erro em linguagem simples, indicando problema e solução.

```typescript
// ✅ CORRETO: Erro claro com solução
{errors.email && (
  <p className="text-sm text-destructive">
    Invalid email address. Please use format: user@example.com
  </p>
)}

// ❌ ERRADO: Erro genérico
{errors.email && <p>Error</p>}
{errors.email && <p>Error code: E_VAL_001</p>}
```

**Aplicações:**
- Mensagens descritivas (não códigos)
- Indicar onde está o erro (highlight campo)
- Sugerir solução
- Links para ajuda contextual

---

### 10. Help and Documentation

**Princípio**: Ideal não precisar documentação, mas quando preciso, deve ser fácil de achar.

```typescript
// ✅ CORRETO: Help contextual inline
<FormField>
  <Label>
    Account Number
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <HelpCircle className="h-4 w-4 ml-1" />
        </TooltipTrigger>
        <TooltipContent>
          <p>Your bank account number (6-10 digits)</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  </Label>
  <Input />
</FormField>
```

**Aplicações:**
- Tooltips em campos complexos
- Placeholder examples
- Empty states com instruções
- FAQ contextual

---

## 🎓 Laws of UX

### Hick's Law

**O tempo para decisão aumenta com número de opções.**

```typescript
// ✅ CORRETO: Opções limitadas e categorizadas
<DropdownMenu>
  <DropdownMenuTrigger>Actions</DropdownMenuTrigger>
  <DropdownMenuContent>
    <DropdownMenuLabel>View</DropdownMenuLabel>
    <DropdownMenuItem>Details</DropdownMenuItem>
    
    <DropdownMenuSeparator />
    
    <DropdownMenuLabel>Modify</DropdownMenuLabel>
    <DropdownMenuItem>Edit</DropdownMenuItem>
    <DropdownMenuItem>Duplicate</DropdownMenuItem>
    
    <DropdownMenuSeparator />
    
    <DropdownMenuItem className="text-destructive">
      Delete
    </DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>

// ❌ ERRADO: Muitas opções sem organização
<Menu>
  <MenuItem>View</MenuItem>
  <MenuItem>Edit</MenuItem>
  <MenuItem>Delete</MenuItem>
  <MenuItem>Duplicate</MenuItem>
  <MenuItem>Archive</MenuItem>
  <MenuItem>Export</MenuItem>
  <MenuItem>Share</MenuItem>
  <MenuItem>Print</MenuItem>
  // ... 20 items
</Menu>
```

---

### Fitts's Law

**Tempo para clicar = f(distância, tamanho).**

```typescript
// ✅ CORRETO: Botões grandes e próximos do contexto
<div className="flex gap-2 mt-4">
  <Button size="lg" className="flex-1">Save</Button>
  <Button size="lg" variant="outline" className="flex-1">Cancel</Button>
</div>

// ❌ ERRADO: Botões pequenos e distantes
<div className="flex justify-between mt-20">
  <Button size="sm">Save</Button>
  <Button size="sm">Cancel</Button>
</div>
```

---

### Miller's Law

**Pessoas lembram apenas 7±2 itens na memória de trabalho.**

```typescript
// ✅ CORRETO: Agrupe em chunks
<nav>
  <NavSection title="Finances">
    <NavItem>Dashboard</NavItem>
    <NavItem>Transactions</NavItem>
    <NavItem>Accounts</NavItem>
  </NavSection>
  
  <NavSection title="Settings">
    <NavItem>Profile</NavItem>
    <NavItem>Security</NavItem>
  </NavSection>
</nav>

// ❌ ERRADO: Lista plana longa
<nav>
  <NavItem>Dashboard</NavItem>
  <NavItem>Transactions</NavItem>
  <NavItem>Accounts</NavItem>
  <NavItem>Categories</NavItem>
  <NavItem>Budget</NavItem>
  <NavItem>Reports</NavItem>
  <NavItem>Goals</NavItem>
  <NavItem>Profile</NavItem>
  <NavItem>Security</NavItem>
  <NavItem>Notifications</NavItem>
  // ... 15 items sem agrupamento
</nav>
```

---

### Serial Position Effect

**Usuários lembram primeiro e último item de uma série.**

```typescript
// ✅ CORRETO: Ações importantes nas pontas
<AlertDialogFooter>
  <AlertDialogCancel>Cancel</AlertDialogCancel>
  {/* ... outras ações secundárias ... */}
  <AlertDialogAction>Confirm</AlertDialogAction>
</AlertDialogFooter>

// Navegação: Logo no início, CTA no final
<Header>
  <Logo />
  {/* ... links do meio ... */}
  <Button>Get Started</Button>
</Header>
```

---

### Von Restorff Effect

**Item que difere destaca-se na memória.**

```typescript
// ✅ CORRETO: Ação destrutiva visualmente distinta
<div className="flex gap-2">
  <Button variant="outline">Cancel</Button>
  <Button variant="outline">Save Draft</Button>
  <Button variant="destructive">
    <Trash2 className="mr-2" />
    Delete Forever
  </Button>
</div>
```

---

### Peak-End Rule

**Experiência é julgada pelo pico e fim, não pela média.**

```typescript
// ✅ CORRETO: Animações de sucesso (momento peak)
const { mutate } = useMutation({
  mutationFn: createTransaction,
  onSuccess: () => {
    // PEAK moment
    confetti();
    toast.success('Transaction created! 🎉');
    
    // END moment
    router.push('/dashboard'); // Leva para próximo passo
  }
});
```

---

## 🎯 Design Thinking Process

Aplique ao construir novas features:

### 1. Empathize (Entender usuário)

```typescript
// Exemplo: "Como usuário, quero categorizar transações RAPIDAMENTE"
// Pain point: Muitos cliques para categorizar
```

### 2. Define (Definir problema)

```typescript
// Problema: "Usuários abandonam categorização pois é trabalhoso"
```

### 3. Ideate (Brainstorm soluções)

```typescript
// Ideia 1: Auto-categorização com ML
// Ideia 2: Quick actions menu (Cmd+K)
// Ideia 3: Bulk edit
// Ideia 4: Categorias sugeridas
```

### 4. Prototype (Prototipar)

```typescript
// Implementar versão simples da Ideia 4
export const CategorySuggestions = ({ description }) => {
  const suggestions = useCategorySuggestions(description);
  
  return (
    <div className="flex gap-2">
      {suggestions.map(cat => (
        <Button key={cat} variant="outline" size="sm">
          {cat}
        </Button>
      ))}
    </div>
  );
};
```

### 5. Test (Testar com usuários)

```typescript
// Medir: tempo para categorizar, taxa de abandono
// Feedback: "Muito melhor! Mas quero personalizar sugestões"
```

### 6. Iterate (Iterar)

```typescript
// V2: Adicionar personalização de sugestões
```

---

## ✅ Silicon Valley Checklist

Antes de commitar um componente, verifique:

- [ ] **Feedback**: Loading states, success/error messages
- [ ] **Linguagem**: Termos familiares, não jargão técnico
- [ ] **Escapatória**: Botões Cancel/Undo sempre visíveis
- [ ] **Consistência**: Mesmos padrões de cores, texto, posições
- [ ] **Prevenção**: Validação em tempo real, disable se inválido
- [ ] **Visibilidade**: Mostra opções, não exige memorização
- [ ] **Atalhos**: Suporta keyboard navigation
- [ ] **Minimalismo**: Só info essencial
- [ ] **Erros claros**: Mensagem + solução
- [ ] **Help contextual**: Tooltips em campos complexos
- [ ] **Mobile-first**: Responsivo desde o início
- [ ] **Acessibilidade**: aria-labels, keyboard support

---

**Lembre-se**: Design não é sobre gosto pessoal. É sobre resolver problemas dos usuários com base em princípios comprovados.

**Fontes:**
- https://lawsofux.com
- https://www.nngroup.com/articles/ten-usability-heuristics/
- https://www.nngroup.com/articles/design-thinking/

**Última atualização**: 2026-04-05
