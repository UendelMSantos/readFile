const fs = require('fs');
const path = require('path');

const inputDirectory = path.join(__dirname, '..', 'data', 'in');
const outputDirectory = path.join(__dirname, '..', 'data', 'out');

//Função para tratar um arquivo
function processFile(filePath) {
    const data = fs.readFileSync(filePath, 'utf8');
    const lines = data.trim().split('\n');

    let clientsCount = 0;
    let sellersCount = 0;
    let mostExpensiveSaleId = null;
    let mostExpensiveSaleAmount = 0;
    let salesmen = {};

    lines.forEach(line => {
        const [dataType, ...fields] = line.split('ç'); //O primeiro dado antes do "ç" armazenado no dataType, o resto em "...fields"
        switch(dataType){
            case '001':
                //id 001 signifca dados do vendedor
                sellersCount++;
                break;
            case '002':
                //id 002 significa dados do cliente
                clientsCount++;
                break;
            case '003':
                //id 003 dados das vendas
                const [saleId, items, salesman] = fields;
                const totalSale = items.split(',').reduce((acc, item) =>{
                    //metodo utilizado para capturar dados que estejam neste padrão dentro de item no formato string
                    const [, , quantity, price] = item.match(/(\d+)-(\d+)-([\d.]+)/); 
                    return acc + quantity * price;
                }, 0);
                if(totalSale > mostExpensiveSaleAmount){
                    mostExpensiveSaleAmount = totalSale;
                    mostExpensiveSaleId = saleId
                }
                salesmen[salesman] = (salesmen[salesman] || 0) + totalSale;
                break;
            
            default:
                // Tipo de dados desconhecido
                break;
        }
    });

    const worstSalesman = Object.keys(salesmen).reduce((worst, salesman) => salesmen[salesman] < salesmen[worst] ? salesman : worst);

    // Geração do relatório após processamento dos dados
    const report = `Quantidade de clientes: ${clientsCount}\nQuantidade de vendedores: ${sellersCount}\nID da venda mais cara: ${mostExpensiveSaleId}\nPior vendedor de todos os tempos: ${worstSalesman}`;

    // Definição do caminho do arquivo de saída
    const outputFilePath = path.join(outputDirectory, `${path.basename(filePath)}.done.dat`);

    // Escrita do relatório no arquivo de saída
    fs.writeFileSync(outputFilePath, report);
}

// Função para ler e processar os arquivos do diretório de entrada
function processInputDirectory() {
    fs.readdirSync(inputDirectory).forEach(file => {
        const filePath = path.join(inputDirectory, file);
        processFile(filePath);
    });
}

// Executar a função para processar os arquivos do diretório de entrada
processInputDirectory();
