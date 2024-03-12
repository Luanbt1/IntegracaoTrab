const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const port = 3000;
app.use(express.json());

// Função para converter os dados do arquivo .txt em objetos JSON
function lerProdutosDoArquivo() {
    const caminhoDoArquivo = path.join(__dirname, 'tabela_produtos.txt'); // Certifique-se de que o caminho está correto
    const conteudoArquivo = fs.readFileSync(caminhoDoArquivo, { encoding: 'utf-8' });
    const linhas = conteudoArquivo.split('\n');
    const cabecalhos = linhas.shift().split(',');

    return linhas.map(linha => {
        const valores = linha.split(',');
        let objeto = {};
        cabecalhos.forEach((cabecalho, index) => {
            objeto[cabecalho] = valores[index];
        });
        return objeto;
    });
}

// Rota GET para exibir todos os produtos
//localhost:3000/produtos
app.get('/produtos', (req, res) => {
    try {
        const produtos = lerProdutosDoArquivo();
        res.json(produtos);
    } catch (erro) {
        res.status(500).send({ erro: 'Erro ao ler os produtos do arquivos' });
    }
});


//Rota GET para exibir produtos filtrados por nome
//localhost:3000/produto?nome=Desinfetante
app.get('/produto', (req, res) => {
    try {
        const nome = req.query.nome;
        const produtos = lerProdutosDoArquivo();
        const produtoFiltrado = produtos.filter(produto => produto.nome.toLowerCase() === nome.toLowerCase());

        if (produtoFiltrado.length > 0) {
            res.json(produtoFiltrado);
        }else {
            res.status(404).send({ erro: 'Produto não encontrado' });
        }
    } catch (erro) {
        res.status(500).send({ erro: 'Erro ao ler os produtos do arquivos' });
    }
});




//localhost:3000/produtosS
//{
    //"nome": "Leite",
    //"empresa": "Parmalate",
    //"descricao": "Leite de vaca",
    //"quantidade": "20",
    //"marca": "Parmalate",
    //"valor": "10.00"
//}
//Post para inserir novos produtos na lista
app.post('/produtosS', (req, res) => {
    const novoProduto = req.body; // Acessa o corpo da requisição

    if (!novoProduto.nome || !novoProduto.empresa || !novoProduto.descricao || !novoProduto.quantidade || !novoProduto.marca || !novoProduto.valor) {
        return res.status(400).send({ erro: 'Um ou mais campos estão faltando' });
    }

    const produtoString = `\n${novoProduto.nome},${novoProduto.empresa},${novoProduto.descricao},${novoProduto.quantidade},${novoProduto.marca},${novoProduto.valor}`;
    
    fs.appendFile(path.join(__dirname, 'tabela_produtos.txt'), produtoString, err => {
        if (err) {
            return res.status(500).send({ erro: 'Erro ao salvar o produto no arquivo' });
        }
        res.send({ mensagem: 'Produto adicionado com sucesso' });
    });
});



//localhost:3000/produtos/Leite
//{
    //"nome": "Leites",
    //"empresa": "Parmalates",
    //"descricao": "Leite de vacas",
    //"quantidade": "200",
    //"marca": "Parmalates",
    //"valor": "100.00"
//}
//rota put para atualizar produtos da lista
app.put('/produtos/:nomeAntigo', (req, res) => {
    const { nomeAntigo } = req.params; // Pega o nome antigo do produto da URL
    const { nome, empresa, descricao, quantidade, marca, valor } = req.body; // Pega todos os detalhes do produto, incluindo o novo nome

    // Verifica se todas as propriedades necessárias foram fornecidas
    if (!nome || !empresa || !descricao || !quantidade || !marca || !valor) {
        return res.status(400).send({ erro: 'Um ou mais campos estão faltando' });
    }

    const caminhoDoArquivo = path.join(__dirname, 'tabela_produtos.txt');
    fs.readFile(caminhoDoArquivo, { encoding: 'utf-8' }, (err, data) => {
        if (err) {
            return res.status(500).send({ erro: 'Erro ao ler o arquivo' });
        }

        const linhas = data.split('\n');
        const indexProduto = linhas.findIndex(linha => linha.startsWith(nomeAntigo + ','));

        if (indexProduto === -1) {
            return res.status(404).send({ erro: 'Produto não encontrado' });
        }

        const produtoAtualizado = `${nome},${empresa},${descricao},${quantidade},${marca},${valor}`;
        linhas[indexProduto] = produtoAtualizado;

        const novoConteudo = linhas.join('\n');
        fs.writeFile(caminhoDoArquivo, novoConteudo, err => {
            if (err) {
                return res.status(500).send({ erro: 'Erro ao atualizar o arquivo' });
            }

            res.send({ mensagem: 'Produto atualizado com sucesso' });
        });
    });
});



//localhost:3000/produtos/Leite
app.delete('/produtos/:nome', (req, res) => {
    const { nome } = req.params; // Pega o nome do produto da URL

    const caminhoDoArquivo = path.join(__dirname, 'tabela_produtos.txt');
    fs.readFile(caminhoDoArquivo, { encoding: 'utf-8' }, (err, data) => {
        if (err) {
            return res.status(500).send({ erro: 'Erro ao ler o arquivo' });
        }

        let linhas = data.split('\n');
        const indexProduto = linhas.findIndex(linha => linha.startsWith(nome + ','));

        if (indexProduto === -1) {
            return res.status(404).send({ erro: 'Produto não encontrado' });
        }

        // Remove a linha correspondente ao produto
        linhas = linhas.filter((_, index) => index !== indexProduto);

        const novoConteudo = linhas.join('\n');
        fs.writeFile(caminhoDoArquivo, novoConteudo, err => {
            if (err) {
                return res.status(500).send({ erro: 'Erro ao atualizar o arquivo' });
            }

            res.send({ mensagem: 'Produto removido com sucesso' });
        });
    });
});


app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});