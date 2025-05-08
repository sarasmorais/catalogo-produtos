
const SUPABASE_URL = "https://nuztfxfcuyvqqpuirnfr.supabase.co"
const SUPABASE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im51enRmeGZjdXl2cXFwdWlybmZyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY2NjcxNzgsImV4cCI6MjA2MjI0MzE3OH0.jzn5vRgc1mWOYUj-O7nfCK86qB5yyF_4qSr6g56TB14"


const supabase = supabaseJs.createClient(SUPABASE_URL, SUPABASE_KEY);




const statusMessage = document.getElementById("status-message")
const produtosContainer = document.getElementById("produtos")
const btnAplicarDesconto = document.getElementById("aplicarDesconto")
const btnResetarDescontos = document.getElementById("resetarDescontos")


function mostrarStatus(mensagem, tipo) {
  if (!statusMessage) return

  statusMessage.textContent = mensagem
  statusMessage.className = `status-message ${tipo}`

  if (tipo === "success") {
    setTimeout(() => {
      statusMessage.textContent = ""
      statusMessage.className = "status-message"
    }, 5000)
  }
}


function formataPreco(preco) {
  return preco.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  })
}


async function buscarProdutos() {
  try {
    mostrarStatus("Carregando produtos...", "loading")
    const { data: produtos, error } = await supabase.from("produtos").select("*").order("id")

    if (error) {
      console.error("Erro ao buscar produtos:", error)
      mostrarStatus("Erro ao carregar produtos.", "error")
      return []
    }

    mostrarStatus("", "")
    return produtos
  } catch (error) {
    console.error("Erro ao buscar produtos:", error)
    mostrarStatus("Erro ao carregar produtos.", "error")
    return []
  }
}


async function renderizarProdutos() {
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
    btnAplicarDesconto.disabled = true
    btnResetarDescontos.disabled = true
    mostrarStatus("Aplicando descontos...", "loading")

    
    const { data: produtos, error: fetchError } = await supabase.from("produtos").select("*").eq("tem_desconto", false)

    if (fetchError) {
      console.error("Erro ao buscar produtos:", fetchError)
      mostrarStatus("Erro ao aplicar descontos.", "error")
      return
    }

    if (produtos.length === 0) {
      mostrarStatus("Todos os produtos já possuem desconto!", "success")
      btnAplicarDesconto.disabled = false
      btnResetarDescontos.disabled = false
      return
    }

    
    for (const produto of produtos) {
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

    
    await renderizarProdutos()
    mostrarStatus("Descontos aplicados com sucesso!", "success")
  } catch (error) {
    console.error("Erro ao aplicar desconto:", error)
    mostrarStatus("Erro ao aplicar descontos.", "error")
  } finally {
    btnAplicarDesconto.disabled = false
    btnResetarDescontos.disabled = false
  }
}


async function resetarDescontos() {
  try {
    btnAplicarDesconto.disabled = true
    btnResetarDescontos.disabled = true
    mostrarStatus("Resetando descontos...", "loading")

    
    const { data: produtos, error: fetchError } = await supabase.from("produtos").select("*").eq("tem_desconto", true)

    if (fetchError) {
      console.error("Erro ao buscar produtos:", fetchError)
      mostrarStatus("Erro ao resetar descontos.", "error")
      return
    }

    if (produtos.length === 0) {
      mostrarStatus("Não há produtos com desconto para resetar!", "success")
      btnAplicarDesconto.disabled = false
      btnResetarDescontos.disabled = false
      return
    }

    
    for (const produto of produtos) {
      const { error: updateError } = await supabase
        .from("produtos")
        .update({
          preco: produto.preco_original,
          tem_desconto: false,
        })
        .eq("id", produto.id)

      if (updateError) {
        console.error(`Erro ao resetar desconto no produto ${produto.id}:`, updateError)
      }
    }

    
    await renderizarProdutos()
    mostrarStatus("Descontos resetados com sucesso!", "success")
  } catch (error) {
    console.error("Erro ao resetar descontos:", error)
    mostrarStatus("Erro ao resetar descontos.", "error")
  } finally {
    btnAplicarDesconto.disabled = false
    btnResetarDescontos.disabled = false
  }
}


btnAplicarDesconto.addEventListener("click", aplicarDesconto)
btnResetarDescontos.addEventListener("click", resetarDescontos)
document.addEventListener("DOMContentLoaded", renderizarProdutos)
