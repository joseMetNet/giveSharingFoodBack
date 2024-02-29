import axios from "axios";

export const authenticateUser = async (email: String, password: String) => {
    try {
        const userManagementUrl = process.env.USER_MANAGEMENT_URL_LOGIN || 'https://usermanagementservicemetnet.azurewebsites.net/UserManagement/authenticationUser';
        const userManagementData = {
            userGroup: process.env.USER_GROUP || 'Usersguivesharingfood',
            userName: email,
            password: password
        };
        const userManagementResponse = await axios.post(userManagementUrl, userManagementData);
        return userManagementResponse;
    } catch (error) {
        throw error;
    }
}

export const createUserInUserManagement = async (email: String, password: String) => {
    try {
        const userManagementUrl = process.env.USERA_MANAGEMENT_URL || 'https://usermanagementservicemetnet.azurewebsites.net/UserManagement';
        const userManagementData = {
            userGroup: process.env.USER_GROUP || 'Usersguivesharingfood',
            userName: email,
            password: password
        };

        const userManagementResponse = await axios.post(userManagementUrl, userManagementData);
        return userManagementResponse.data.data[0].id;
    } catch (error) {
        throw new Error("Error creating user in user management service");
    }
};