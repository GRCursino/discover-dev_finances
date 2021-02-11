const Modal = {
    open(){
        // Abrir modal, adicionar a classe active ao modal
        document
            .querySelector('.modal-overlay')
            .classList.add('active')
    },
    close(){
        //Fechar modal, remover a classe active do modal
        document
            .querySelector('.modal-overlay')
            .classList.remove('active')
    }
}

const Storage ={
    get(){
        return JSON.parse(localStorage.getItem("dev.finances:transactions")) || []
    },

    set(transactions){
        localStorage.setItem("dev.finances:transactions",
        JSON.stringify(transactions));
    }
}

const Transaction = {

        all: Storage.get(),

        add(transaction) {
            Transaction.all.push(transaction)
            
            App.reload()
        },

        remove(index){
                Transaction.all.splice(index, 1) // método aplicado em array, retorna o index do array
                                                 // na aplicação vai retornar o index do elemento selecionado na tabela, o 1 é para 
                                                 // quantos elementos ele vai remover, nesse caso 1 é para somento o elemento clicado   

                App.reload()
            },                                      

        incomes() {
            //entradas

            let income = 0;

            //pegando as transações
            Transaction.all.forEach( (valor) => {
                if( valor.amount > 0 ){
                    income += valor.amount;
                }
            })

            return income;
        },

        expenses() {
            //saidas

            let expense = 0;

            Transaction.all.forEach( (valor) => {
                if (valor.amount < 0){
                    expense += valor.amount;
                }
            })

            return expense
        },

        total(){
            //entradas - saídas

            return Transaction.incomes() + Transaction.expenses()
        }
}

const DOM = {

    transactionsContainer: document.querySelector('#data-table tbody'),

    addTransaction(transaction, index){
        const tr = document.createElement('tr')
        tr.innerHTML = DOM.innerHTMLTransaction(transaction, index)
        tr.dataset.index = index
        DOM.transactionsContainer.appendChild(tr)
    },

    innerHTMLTransaction(transaction, index){

        //Alterar a cor de entrada ou saída chamando o CSS
        const CSSClass = transaction.amount > 0 ? "income" : "expense"

        const amount = Utils.formatCurrency(transaction.amount) 

        const html = `
      
            <td class="description">${transaction.description}</td>
            <td class="${CSSClass}">${amount}</td>
            <td class="date">${transaction.date}</td>
            <td>
                <img onclick="Transaction.remove(${index})" src="./assets/minus.svg" alt="Remover transação">
            </td>
               
        `

        return html
    },

    updateBalance(){
        document
            .getElementById('incomeDisplay')
            .innerHTML = Utils.formatCurrency(Transaction.incomes())
        document
            .getElementById('expenseDisplay')
            .innerHTML = Utils.formatCurrency(Transaction.expenses())
        document
            .getElementById('totalDisplay')
            .innerHTML = Utils.formatCurrency(Transaction.total())
    },

    clearTransactions(){
        DOM.transactionsContainer.innerHTML = ""
    }
}

const Utils = {

    formatCurrency(value) {
        
        //transaformando o value em formato numérico
        const signal = Number(value) < 0 ? "-" : ""
        
        value = String(value).replace(/\D/g, "") // o trecho " /\D/g " vai pesquisar tudo que for caracter diferente ou especial
        value = Number(value) / 100
        value = value.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
        })

        return signal + value
    },

    formatAmount(value) {
        
        value = Number(value) * 100

        return Math.round(value)
    },

    formatDate(date) {
        
        const splittedDate = date.split("-")

        return `${splittedDate[2]}/${splittedDate[1]}/${splittedDate[0]}`
    },
}

const Form = {

    description: document.querySelector('input#description'),
    amount: document.querySelector('input#amount'),
    date: document.querySelector('input#date'),

    getValues(){

        return {
            description: Form.description.value,
            amount: Form.amount.value,
            date: Form.date.value
        }
    },

     // verificar se todas informações foram preenchidas
    validateFields(){
        const {description, amount, date} = Form.getValues()
        if(description.trim() === "" || amount.trim() === "" || date.trim() === ""){
            throw new Error("Por favor, preencha todos os campos.")
        }
    },

    formatValues(){
        let {description, amount, date} = Form.getValues()
        
        amount = Utils.formatAmount(amount)
        date = Utils.formatDate(date)

        return {
            description,
            amount,
            date
        }
    },

    clearFields(){
        Form.description.value = ""
        Form.amount.value = ""
        Form.date.value = ""
    },

    submit(event){
        event.preventDefault()
        
        try {

        // verificar se todas informações foram preenchidas
        Form.validateFields()

        // formatar os dados para salvar
        const transaction = Form.formatValues()

        // salvar
        Transaction.add(transaction)
        
        // zerar o formulario
        Form.clearFields()    
        
        // fechar o modal
        Modal.close()

        
        } catch (error) {
            alert(error.message)
        }
        
    }
}

const App = {

    init(){

        Transaction.all.forEach(DOM.addTransaction)
        
        DOM.updateBalance()

        Storage.set(Transaction.all)
    },

    reload(){
        DOM.clearTransactions()
        App.init()
    }
}

App.init()

