import { SubsManager } from 'meteor/meteorhacks:subs-manager';

export const listEventsSubs = new SubsManager({
    cacheLimit: 500,
    expireIn: 60
});
export const listSousEventsSubs = new SubsManager({
    cacheLimit: 500,
    expireIn: 60
});
export const listOrganizationsSubs = new SubsManager({
    cacheLimit: 500,
    expireIn: 60
});
export const listProjectsSubs = new SubsManager({
    cacheLimit: 500,
    expireIn: 60
});
export const listCitoyensSubs = new SubsManager({
    cacheLimit: 500,
    expireIn: 60
});
export const newsListSubs = new SubsManager({
    cacheLimit: 500,
    expireIn: 60
});
export const filActusSubs = new SubsManager({
    cacheLimit: 500,
    expireIn: 60
});
export const directoryListSubs = new SubsManager({
    cacheLimit: 800,
    expireIn: 60
});
export const dashboardSubs = new SubsManager({
    cacheLimit: 500,
    expireIn: 60
});
export const listsSubs = new SubsManager({
    cacheLimit: 500,
    expireIn: 60
});

export const singleSubs = new SubsManager();
