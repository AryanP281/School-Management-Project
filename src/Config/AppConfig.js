
/**************Variables********** */
const responseCodes = {
    success: 0,
    invalidToken: 1,
    adminAlreadyExists: 2,
    adminDoesntExist:3,
    incorrectPassword:4
};

const apiBaseUrl = "http://localhost:5000"

const apiHeader = () => {return {
    "Authorization" : localStorage.getItem("token")
}};

const checkAuthStatus = () => localStorage.getItem("token");

/**************Exports********** */
export {responseCodes,apiBaseUrl, apiHeader};