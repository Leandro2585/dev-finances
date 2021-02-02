const modal_overlay = document.querySelector('.modal-overlay');
const modal = {
  open() {
    modal_overlay.classList.add('active');
  },
  close() {
    modal_overlay.classList.remove('active');
  }
}

const Storage = {
  get() {
    return JSON.parse(localStorage.getItem("dev.finances:transactions")) || [];
  },
  set(transactions) {
    localStorage.setItem("dev.finances:transactions", JSON.stringify(transactions));
  }
}

const Transaction = {
  all: Storage.get(),
  add(transaction){
      Transaction.all.push(transaction);
      app.reload();
  },
  remove(index){
    Transaction.all.splice(index, 1);
    app.reload();
  },
  incomes() {
    let income = 0;
    Transaction.all.forEach((transaction) => {
      if(transaction.amount > 0) {
        income += transaction.amount;
      }
    });

    return income;
  },
  expenses() {
    let expense = 0;
    Transaction.all.forEach((transaction) => {
      if(transaction.amount < 0) {
        expense += transaction.amount;
      }
    });
    return expense;
  },
  total() {
    return Transaction.incomes() + Transaction.expenses();
  }
}

const DOM = {
  transactionsContainer: document.querySelector('#data-table tbody'),
  addTransaction(transaction, index) {
    const tr = document.createElement('tr');
    tr.innerHTML = DOM.innerHTMLTransaction(transaction, index);
    tr.dataset.index = index;
    DOM.transactionsContainer.appendChild(tr);
  },
  innerHTMLTransaction(transaction, index) {
    const CSSclass = transaction.amount > 0 ? "income" : "expense";
    const amount = utils.formatCurrency(transaction.amount);
    const html = `
        <td class="description">${transaction.description}</td>
        <td class="${CSSclass}">${amount}</td>
        <td class="date">${transaction.date}</td>
        <td>
          <img onclick="Transaction.remove(${index})" src="./assets/minus.svg" alt="remover transação"/>
        </td>
    `;

    return html;
  },
  updateBalance() {
    document
      .getElementById('income-display')
      .innerHTML = utils.formatCurrency(Transaction.incomes());
    document
      .getElementById('expense-display')
      .innerHTML =  utils.formatCurrency(Transaction.expenses());
    document
      .getElementById('total-display')
      .innerHTML =  utils.formatCurrency(Transaction.total());
  },
  clearTransactions() {
    DOM.transactionsContainer.innerHTML = ""
  }
}

const utils = {
  formatDate(date) {
    const parsedDate = date.split("-");
    return `${parsedDate[2]}/${parsedDate[1]}/${parsedDate[0]}`;
  },
  formatAmount(value) {
    value = Number(value) * 100;
    return value;
  },
  formatCurrency(value) {
    const signal = Number(value) < 0 ? "-": "";
    value = String(value).replace(/\D/g, "");
    value = Number(value) / 100;
    value = value.toLocaleString('pt-BR', {
      style: "currency",
      currency: "BRL"
    });

    return signal + value;
  }
}

const form = {
  description: document.querySelector('input#description'),
  amount: document.querySelector('input#amount'),
  date: document.querySelector('input#date'),

  getValues() {
    return {
      description: form.description.value,
      amount: form.amount.value,
      date: form.date.value
    }
  },
  validateFields() {
    const { description, amount, date } = form.getValues();
    if(
      description.trim() === "" ||
      amount.trim() === "" ||
      amount.trim() === ""){
      throw new Error("Por favor, preencha todos os campos");
    }
  },
  formatValues() {
    let { description, amount, date } = form.getValues();
    amount = utils.formatAmount(amount);
    date = utils.formatDate(date);
    return {
      description,
      amount,
      date
    }
  },
  clearFields() {
    form.description.value = "";
    form.amount.value = "";
    form.date.value = "";
  },
  submit(event) {
    event.preventDefault();

    try {
      form.validateFields();
      const transaction = form.formatValues();
      Transaction.add(transaction);
      form.clearFields();
      modal.close();
    } catch (error) {
      alert(error.message);
    }
  }
};
const listen = {
  config() {
    utterance = new SpeechSynthesisUtterance();
    utterance.lang = "pt-BR";
  },
  income() {
    listen.config();

    utterance.text = "A sua receita equivale a "+ utils.formatCurrency(Transaction.incomes());
    speechSynthesis.speak(utterance);
  },
  expense() {
    listen.config();
    utterance.text = "As suas despesas totalizam "+ utils.formatCurrency(Transaction.expenses());
    speechSynthesis.speak(utterance);
  },
  total() {
    listen.config();
    utterance.text = "O seu saldo total é de "+ utils.formatCurrency(Transaction.total());
    speechSynthesis.speak(utterance);
  }
}
const app = {
  init() {
    Transaction.all.forEach(DOM.addTransaction);
    DOM.updateBalance();

    Storage.set(Transaction.all);
  },
  reload() {
    DOM.clearTransactions();
    app.init();
  }
}
app.init();
