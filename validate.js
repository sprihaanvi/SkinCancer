function validateFormFields() {
    const age = document.getElementById("age").value.trim();
    const gender = document.getElementById("gender").value;
    const localization = document.getElementById("localization").value.trim();
  
    if (!age || age <= 0) {
      alert("Please enter a valid age.");
      return false;
    }
  
    if (!gender) {
      alert("Please select your gender.");
      return false;
    }
  
    if (!localization) {
      alert("Please enter the localization.");
      return false;
    }
  
    return true;
  }
  
  function simulateClick(tabID) {
    if (validateFormFields()) {
      document.getElementById(tabID).click();
    }
  }
  