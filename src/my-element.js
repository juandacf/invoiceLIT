import { LitElement, html, css } from 'https://cdn.skypack.dev/lit';

class InvoiceApp extends LitElement {
  static styles = css`
    .bold {
      font-weight: bold;
      cursor: pointer;
    }
    .finalCard {
      padding: 1rem;
    }
  `;

  static properties = {
    receiptID: { type: String },
    mainContainer: { type: Array },
  };

  constructor() {
    super();
    this.receiptID = Date.now().toString(16);
    this.mainContainer = [
      {
        [this.receiptID]: {
          header: {},
          products: [],
          summary: {
            subTotal: 0,
            iva: 0,
            total: 0,
          },
        },
      },
    ];
  }

  addProduct(products) {
    const subTotal = products.quantity * products.unitValue;
    const elementClass = new Date().getMilliseconds().toString(16);
    const purchase = {
      purchaseID: elementClass,
      productCode: products.productCode,
      productName: products.productName,
      quantity: products.quantity,
      unitValue: products.unitValue,
    };

    this.mainContainer[0][this.receiptID].products.push(purchase);
    this.mainContainer[0][this.receiptID].summary.subTotal += subTotal;
    this.mainContainer[0][this.receiptID].summary.iva = this.mainContainer[0][this.receiptID].summary.subTotal * 0.19;
    this.mainContainer[0][this.receiptID].summary.total =
      this.mainContainer[0][this.receiptID].summary.subTotal +
      this.mainContainer[0][this.receiptID].summary.iva;
    this.requestUpdate();
  }

  deleteProduct(purchaseID) {
    const products = this.mainContainer[0][this.receiptID].products;
    const productIndex = products.findIndex((p) => p.purchaseID === purchaseID);
    if (productIndex !== -1) {
      const removedProduct = products.splice(productIndex, 1)[0];
      this.mainContainer[0][this.receiptID].summary.subTotal -= removedProduct.quantity * removedProduct.unitValue;
      this.mainContainer[0][this.receiptID].summary.iva = this.mainContainer[0][this.receiptID].summary.subTotal * 0.19;
      this.mainContainer[0][this.receiptID].summary.total =
        this.mainContainer[0][this.receiptID].summary.subTotal +
        this.mainContainer[0][this.receiptID].summary.iva;
      this.requestUpdate();
    }
  }

  handleSubmit(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData);
    const personalInfo = {
      personAdress: data.personAddress,
      personEmail: data.personEmail,
      personID: data.personID,
      personLastName: data.personLastname,
      personName: data.personName,
    };
    Object.assign(this.mainContainer[0][this.receiptID].header, personalInfo);
    this.addProduct(data);
  }

  finalizeReceipt() {
    const finalReceipt = JSON.stringify(this.mainContainer);
    alert(`La información final del recibo es: ${finalReceipt}`);
    console.log(finalReceipt);
    location.reload();
  }

  render() {
    return html`
      <div class="card">
        <div class="card-header">Factura # ${this.receiptID}</div>
        <form @submit="${this.handleSubmit}">
          <div class="card-body">
            <input name="personID" placeholder="Número ID" required />
            <input name="personName" placeholder="Nombres" required />
            <input name="personLastname" placeholder="Apellidos" required />
            <input name="personAddress" placeholder="Dirección" required />
            <input name="personEmail" placeholder="E-mail" required />
          </div>
          <div class="card-body">
            <input name="productCode" placeholder="Código Producto" required />
            <input name="productName" placeholder="Nombre Producto" required />
            <input name="unitValue" type="number" placeholder="Valor Unidad" required />
            <input name="quantity" type="number" placeholder="Cantidad" required />
            <button type="submit">Agregar Producto</button>
          </div>
        </form>
      </div>
      <table>
        <tr>
          <th>Código</th>
          <th>Nombre</th>
          <th>Valor Unidad</th>
          <th>Cantidad</th>
          <th>Subtotal</th>
          <th>Eliminar</th>
        </tr>
        ${this.mainContainer[0][this.receiptID].products.map(
          (product) => html`
            <tr>
              <td>${product.productCode}</td>
              <td>${product.productName}</td>
              <td>${product.unitValue}</td>
              <td>${product.quantity}</td>
              <td>${product.quantity * product.unitValue}</td>
              <td class="bold" @click="${() => this.deleteProduct(product.purchaseID)}">X</td>
            </tr>
          `
        )}
      </table>
      <div>
        <p>Subtotal: ${this.mainContainer[0][this.receiptID].summary.subTotal}</p>
        <p>Iva (19%): ${this.mainContainer[0][this.receiptID].summary.iva}</p>
        <p>Total: ${this.mainContainer[0][this.receiptID].summary.total}</p>
        <button @click="${this.finalizeReceipt}">Pagar</button>
      </div>
    `;
  }
}

customElements.define('invoice-app', InvoiceApp);

const project = document.createElement('invoice-app');

document.body.appendChild(project);

