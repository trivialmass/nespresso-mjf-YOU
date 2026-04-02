/**
 * Service to save quiz results to Google Sheets via Apps Script Web App
 */

const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwScLi91ukZimALDfes10x-BUmWlE1AtABzPV6H-RbjHhQx-7NR_dxmHgkBYukqSCbx_g/exec";

/**
 * Saves the quiz result to Google Sheets via Apps Script Web App
 * @param {Object} userData - { name, company, email }
 * @param {Array} answers - array of answers
 * @param {string} profile - generated profile
 * @returns {Promise<boolean>} - always returns true (cannot check result in no-cors mode)
 */
export const saveQuizResult = async (userData, answers, profile) => {
  const formData = new FormData();
  formData.append('Name', userData?.userData[0]?.name || "");
  formData.append('Company', userData?.userData[0]?.company || "");
  formData.append('Email', userData?.userData[0]?.email || "");
  formData.append('Answers', answers.map(item => `${item.question.question1} || ${item.question.question2} => ${item.answer}`).join('\n'));
  formData.append('Profile', profile);

  try {
    await fetch(APPS_SCRIPT_URL, {
      method: "POST",
      mode: "no-cors",
      body: formData
    });
    return true;
  } catch (error) {
    console.error("Save error:", error);
    return false;
  }
};