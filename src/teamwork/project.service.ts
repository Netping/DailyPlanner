import { TeamWorkService } from "./teamwork.service";

export class ProjectService {

    public constructor(
        protected teamWorkService: TeamWorkService
    ) {
    }

    /*public async getTasks(): Promise<Task[]> {
        return [
            {id: 1, name: 'task1', 'url': 'sdsd', time_estimated: 1000, time_day_log: 21},
            {id: 2, name: 'task2', 'url': 'sdsd', time_estimated: 1000, time_day_log: 21},
            {id: 3, name: 'task3', 'url': 'sdsd', time_estimated: 1000, time_day_log: 21}
        ];
    }*/

    public async getProjects(): Promise<any[]> {
        let domain = await this.teamWorkService.getDomain();
        return new Promise<any[]>((resolve, reject) => {
            jQuery.ajax('https://' + domain + '/projects/api/v2/projects.json').done(data => {
                resolve(data && data.projects ? data.projects : []);
            }).fail(error => {
                reject(error);
            });
        });
    }

    public async getTags(): Promise<any[]> {
        let domain = await this.teamWorkService.getDomain();
        return new Promise<any[]>((resolve, reject) => {
            jQuery.ajax('https://' + domain + '/tags.json').done(data => {
                resolve(data && data.tags ? data.tags : []);
            }).fail(error => {
                reject(error);
            });
        });
    }

    public async getTimeEntries(taskId: number): Promise<any[]> {
        let domain = await this.teamWorkService.getDomain();
        return new Promise<any[]>((resolve, reject) => {
            jQuery.ajax('https://' + domain + '/projects/api/v2/tasks/' + taskId + '/time_entries.json?getTotals=true&includeSubTasks=1&page=1&pageSize=250').done(data => {
                resolve(data && data.timeEntries ? data.timeEntries : []);
            }).fail(error => {
                reject(error);
            });
        });
    }

}
