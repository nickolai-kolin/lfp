
function main() {
  let orderForm = document.getElementById("order-form");

  // Preset

  const nonValidCssClass = "form__input--nonvalid";
  const API_EMAIL = "https://webdev-api.loftschool.com/sendmail";

  // Utils
  const createErrorMsgEl = (msg, _class = "form__validation") => {
    // Return Error Object for appending
    const errorMsgEl = document.createElement("span");
    errorMsgEl.classList.add(_class);
    errorMsgEl.textContent = msg;
    return errorMsgEl;
  };

  const removeNonValidFields = (form) => {
    // Get all validaiton fields a.k.a Error Fields
    for (let input of form.elements) {
      input.classList.remove("form__input--nonvalid");
    }
    const allErrorMsgEl = form.querySelectorAll(".form__validation");
    Array.from(allErrorMsgEl).forEach((el) => el.remove());
  };

  // Utils End

  // Main Logic

  orderForm.onsubmit = function (ev) {
    // this = ev.currentTarget
    ev.preventDefault();
    removeNonValidFields(this);
    const customInputNamesForSending = ["name", "phone", "comment", "to"];
    // Validation
    let validFlag = true;
    let resultObj = {};
    for (const name of customInputNamesForSending) {
      const currentInput = this.elements[name];
      // Populating resultObj
      resultObj[`${name}`] = currentInput.value;

      currentInput.checkValidity();
      if (currentInput.validationMessage) {
        const ErrorMsgEl = createErrorMsgEl(currentInput.validationMessage);
        currentInput.after(ErrorMsgEl);
        currentInput.classList.add(nonValidCssClass);
        validFlag = false;
      }
    }
    if (validFlag) {
      const resultObjJSON = JSON.stringify(resultObj);
      sendForm(resultObjJSON);
    }
  };

  const modalEl = document.getElementById("modal");
  const modalClose = modalEl.querySelector(".modal__close");
  const overlay = document.getElementById("overlay");
  const modalHeader = modalEl.querySelector(".modal__header");
  
  modalClose.onclick = () => hideModal();
  overlay.onclick = () => hideModal();
  
  
  function showModal(msg='', error=false) {
    modalEl.classList.add("modal--active");
    overlay.classList.add("overlay--active");    
    if (error) {
      modalEl.classList.add('modal--error');
    }
    modalHeader.innerText = msg;
  }

  function hideModal() {
    modalEl.classList.remove("modal--active");
    modalEl.classList.remove("modal--error");
    overlay.classList.remove("overlay--active");
  }

  function sendForm(payload) {
    const client = new XMLHttpRequest();
    client.open("POST", API_EMAIL);
    client.setRequestHeader("content-type", "application/json");
    client.responseType = "json";
    client.send(payload);
    client.onload = () => {
      const resp = client.response;
      const error = resp.status == 1 ? false : true;
      showModal(resp.message, error);
    };
  }
}

main();
