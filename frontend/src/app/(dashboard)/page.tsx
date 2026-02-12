export default function DashboardHomePage() {
  return (
    <main className="space-y-6">
      <section className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground text-sm">
          Bem-vindo ao painel do Stock Control. Selecione um modulo na navegacao lateral para
          comecar.
        </p>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-lg border p-4">
          <h2 className="text-sm font-medium">Produtos</h2>
          <p className="text-muted-foreground mt-2 text-sm">
            Cadastro e controle de estoque dos produtos.
          </p>
        </article>

        <article className="rounded-lg border p-4">
          <h2 className="text-sm font-medium">Categorias</h2>
          <p className="text-muted-foreground mt-2 text-sm">
            Organizacao dos produtos por grupos de categoria.
          </p>
        </article>

        <article className="rounded-lg border p-4">
          <h2 className="text-sm font-medium">Movimentacoes</h2>
          <p className="text-muted-foreground mt-2 text-sm">
            Registro de entradas e saidas com rastreabilidade.
          </p>
        </article>

        <article className="rounded-lg border p-4">
          <h2 className="text-sm font-medium">Usuarios</h2>
          <p className="text-muted-foreground mt-2 text-sm">
            Gestao de usuarios e perfis de acesso.
          </p>
        </article>
      </section>
    </main>
  );
}
