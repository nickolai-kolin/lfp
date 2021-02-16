function myForm() {
  // Presets
  const API_EMAIL = "https://webdev-api.loftschool.com/sendmail";

  const nonValidCssClass = "form__input--nonvalid";
  const customInputNamesForSending = ["name", "phone", "comment", "to"];

  // Selectors

  const modalEl = document.getElementById("modal");
  const modalHeader = document.querySelector(".modal__header");
  const overlay = document.getElementById("overlay");
  const orderForm = document.getElementById("order-form");

  // Support Func

  function createErrorMsgEl(msg, _class = "form__validation") {
    // Return Error Object for appending
    const errorMsgEl = document.createElement("span");
    errorMsgEl.classList.add(_class);
    errorMsgEl.textContent = msg;
    return errorMsgEl;
  }

  function removeAllErrorMsg(form) {
    // Remove non-valid css class
    Array.from(form.elements).forEach((el) =>
      el.classList.remove("form__input--nonvalid")
    );
    // Remove Error Elements
    const allErrorMsgEl = form.querySelectorAll(".form__validation");
    Array.from(allErrorMsgEl).forEach((el) => el.remove());
  }

  function clearForm(form) {
    // form.reset();
    Array.from(form.elements).forEach((el) => (el.value = ""));
  }

  function toggleBodyScroll() {
    const isScrollHidden = document.body.style.overflow == "hidden";
  }

  function toggleFixedNav() {
    const fixedSideNav = document.getElementById("fixed-sidenav");
    console.log(fixedSideNav.style.display);
    fixedSideNav.style.display =
      fixedSideNav.style.display == "none" ? "block" : "none";
  }

  function showValidationErrorMsg(el, msg) {
    const ErrorMsgEl = createErrorMsgEl(msg);
    el.after(ErrorMsgEl);
  }

  function hideModal() {
    toggleBodyScroll();
    toggleFixedNav();
    modalEl.classList.remove("modal--active");
    modalEl.classList.remove("modal--error");
    overlay.classList.remove("overlay--active");
  }

  function showModal(msg = "", error = false) {
    toggleBodyScroll();
    toggleFixedNav();
    modalEl.classList.add("modal--active");
    overlay.classList.add("overlay--active");
    // Adding Error Color for modal heading
    if (error) {
      modalEl.classList.add("modal--error");
    }
    modalHeader.innerText = msg;
  }

  function isValidForm(form) {
    // Validation Step
    const statusArr = customInputNamesForSending.map((name) => {
      const currentInput = form.elements[name];
      currentInput.checkValidity();

      if (currentInput.validationMessage) {
        showValidationErrorMsg(currentInput, currentInput.validationMessage);
        return false;
      }
      return true;
    });
    return statusArr.every((status) => status === true);
  }

  function sendRequestXHR(payload, request_url = API_EMAIL) {
    const client = new XMLHttpRequest();
    client.open("POST", request_url);
    client.responseType = "json";
    client.send(payload);
    client.onload = () => {
      const resp = client.response;
      const error = resp.status == 1 ? false : true;

      showModal(resp.message, error);
    };
  }

  // Main Logic
  orderForm.addEventListener("submit", function (ev) {
    ev.preventDefault();
    removeAllErrorMsg(this); // Clearing Last Submit Errors

    if (isValidForm(this)) {
      sendRequestXHR(new FormData(this));
      clearForm(this);
    }
  });

  overlay.addEventListener("click", () => hideModal());
}
myForm();
