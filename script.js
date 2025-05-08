
const SUPABASE_URL = "https://nuztfxfcuyvqqpuirnfr.supabase.co"
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im51enRmeGZjdXl2cXFwdWlybmZyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY2NjcxNzgsImV4cCI6MjA2MjI0MzE3OH0.jzn5vRgc1mWOYUj-O7nfCK86qB5yyF_4qSr6g56TB14" 

const supabase = supabaseJs.createClient(SUPABASE_URL, SUPABASE_KEY)

function formataPreco(preco) {
  return preco.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  })
}

async function buscarProdutos() {
  try {
    const { data: produtos, error } = await supabase.from("produtos").select("*").order("id")

    if (error) {
      console.error("Erro ao buscar produtos:", error)
      return []
    }

    return produtos
  } catch (error) {
    console.error("Erro ao buscar produtos:", error)
    return []
  }
}


async function renderizarProdutos() {
  const produtosContainer = document.getElementById("produtos")
  produtosContainer.innerHTML = "<p>Carregando produtos...</p>"

  const produtos = await buscarProdutos()

  if (produtos.length === 0) {
    produtosContainer.innerHTML = "<p>Nenhum produto encontrado.</p>"
    return
  }

  produtosContainer.innerHTML = ""

  produtos.forEach((produto) => {
    const produtoCard = document.createElement("div")
    produtoCard.className = "produto-card"

    const produtoInfo = document.createElement("div")
    produtoInfo.className = "produto-info"

    const produtoNome = document.createElement("h3")
    produtoNome.className = "produto-nome"
    produtoNome.textContent = produto.nome

    const produtoDescricao = document.createElement("p")
    produtoDescricao.className = "produto-descricao"
    produtoDescricao.textContent = produto.descricao

    const produtoPreco = document.createElement("div")
    produtoPreco.className = "produto-preco"

    if (produto.tem_desconto) {
      const precoOriginal = document.createElement("span")
      precoOriginal.className = "preco-original"
      precoOriginal.textContent = formataPreco(produto.preco_original)

      const precoDesconto = document.createElement("span")
      precoDesconto.className = "preco-desconto"
      precoDesconto.textContent = formataPreco(produto.preco)

      produtoPreco.appendChild(precoOriginal)
      produtoPreco.appendChild(precoDesconto)
    } else {
      produtoPreco.textContent = formataPreco(produto.preco)
    }

    produtoInfo.appendChild(produtoNome)
    produtoInfo.appendChild(produtoDescricao)
    produtoInfo.appendChild(produtoPreco)

    produtoCard.appendChild(produtoInfo)
    produtosContainer.appendChild(produtoCard)
  })
}


async function aplicarDesconto() {
  try {
    // Primeiro, buscar todos os produtos
    const { data: produtos, error: fetchError } = await supabase.from("produtos").select("*")

    if (fetchError) {
      console.error("Erro ao buscar produtos:", fetchError)
      return
    }

    
    for (const produto of produtos) {
      if (!produto.tem_desconto) {
        const novoPreco = produto.preco * 0.9

        const { error: updateError } = await supabase
          .from("produtos")
          .update({
            preco: novoPreco,
            tem_desconto: true,
          })
          .eq("id", produto.id)

        if (updateError) {
          console.error(`Erro ao aplicar desconto no produto ${produto.id}:`, updateError)
        }
      }
    }

    
    await renderizarProdutos()
  } catch (error) {
    console.error("Erro ao aplicar desconto:", error)
  }
}


document.getElementById("aplicarDesconto").addEventListener("click", aplicarDesconto)
document.addEventListener("DOMContentLoaded", renderizarProdutos)
