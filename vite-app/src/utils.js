function projectNameToId(projectName='') {
    const cleanName = projectName.replace(/[^a-z0-9äöå]/gi, '_');
    const projectId = encodeURIComponent(cleanName);

    return projectId;
}

function getUser() {
    const userStr = localStorage.getItem('user');
    return JSON.parse(userStr);
}

export { projectNameToId, getUser };