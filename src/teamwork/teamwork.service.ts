import { ProjectService } from "./project.service";
import { Task } from "./task";

export class TeamWorkService {
    protected projectService = new ProjectService(this);

    public async init(): Promise<void> {
        let domain = await this.getDomain();
        if (!domain) return;
        await this.storeDomain(domain);
    }

    public async getDomain(): Promise<string | null> {
        return this.getDomainFromUrl(await this.getTabUrl()) || await this.getStoredDomain();
    }

    public async hasDomain(): Promise<boolean> {
        return await this.getDomain() ? true : false;
    }

    public async isAuthenticated(): Promise<boolean> {
        return await this.getPeople() ? true : false;
    }

    public async getPeople(): Promise<any | null> {
        if (!await this.hasDomain()) {
            return null;
        }
        let domain = await this.getDomain();
        return new Promise<string | null>(resolve => {
            jQuery.ajax('https://' + domain + '/projects/api/v2/people/status.json').done(data => {
                if (typeof data == "string") data = JSON.parse(data);
                resolve(data.person ? data.person : null);
            }).fail(error => {
                resolve(null);
            });
        });
    }

    public async getTasks(): Promise<Task[]> {
        let domain = await this.getDomain();
        let tagId = this.getTagIdByName(await this.projectService.getTags(), 'plan');
        let people = await this.getPeople();
        if (!tagId) return [];
        return new Promise<Task[]>((resolve, reject) => {
            jQuery.ajax('https://' + domain + '/projects/api/v2/tasks.json?tagIds=' + tagId + '&matchAllTags=true&responsible-party-ids=' + people.id).done(async (data) => {
                let tasks: any[] = data && data.tasks ? data.tasks : [];
                for (let task of tasks) {
                    let timeEntries = await this.projectService.getTimeEntries(task.id);
                    task.timeEntries = timeEntries.filter(entry => {
                        return new Date(entry.date).toDateString() == new Date().toDateString();
                    });
                }
                resolve(tasks.map(task => this.toTask(domain, task)));
            }).fail(error => {
                reject(error);
            });
        });
    }

    protected toTask(domain: string, data: any): Task {
        let timeDayLog = 0;
        for (let entry of data.timeEntries) {
            timeDayLog += entry.hours * 60 + entry.minutes;
        }
        return {
            id: data.id,
            name: data.name,
            time_estimated: data.numEstMins,
            time_day_log: timeDayLog,
            url: 'https://' + domain + '/#/tasks/' + data.id
        };
    }

    protected getTagIdByName(tags: any[], name: string): number | null {
        for (let tag of tags) {
            if (tag.name.toLowerCase() == name.toLowerCase()) return tag.id;
        }
        return null;
    }

    protected async getTabUrl(): Promise<string | null> {
        return new Promise<string | null>(resolve => {
            chrome.tabs.query({currentWindow: true, active: true}, tabs => {
                if (tabs && tabs[0] && tabs[0].url) {
                    resolve(tabs[0].url);
                } else {
                    resolve(null);
                }
            });
        });
    }

    protected async getStoredDomain(): Promise<string | null> {
        return new Promise<string | null>(resolve => {
            chrome.storage.sync.get(['teamwork_domain'], result => {
                resolve(result.teamwork_domain || null);
            });
        });
    }

    protected async storeDomain(domain: string): Promise<void> {
        return new Promise<void>(resolve => {
            chrome.storage.sync.set({teamwork_domain: domain}, () => {
                resolve();
            });
        });
    }

    protected getDomainFromUrl(url: string): string | null {
        if (!url || url.trim().length == 0) return null;
        let a = document.createElement('a');
        a.href = url;
        let hostname = a.hostname;
        a.remove();
        return hostname;
    }

}
