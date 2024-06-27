// temporaryStorage.js
const tempRegistrations = {};

const addTempRegistration = (id, data) => {
    tempRegistrations[id] = data;
};

const getTempRegistration = (id) => {
    return tempRegistrations[id];
};

const deleteTempRegistration = (id) => {
    delete tempRegistrations[id];
};

module.exports = {
    addTempRegistration,
    getTempRegistration,
    deleteTempRegistration
};
