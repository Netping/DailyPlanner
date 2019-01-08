import Component from "vue-class-component";
import Vue from "vue";
import { TeamWorkService } from "teamwork/teamwork.service";
import { Task } from "teamwork/task";

@Component({
    template: require('./tasks.component.html'),
    inject: [
        'teamWorkService'
    ]
})
export class TasksComponent extends Vue {
    protected teamWorkService: TeamWorkService;
    public people: any = null;
    public domain: string = null;
    public profileUrl: string = null;
    public url: string = null;
    public tasks: Task[] = null;
    public total: Task = null;

    public async created(): Promise<void> {
        this.people = await this.teamWorkService.getPeople();
        this.domain = await this.teamWorkService.getDomain();
        this.profileUrl = 'https://' + this.domain + '/#/people/' + this.people.id + '/details';
        this.url = 'https://' + this.domain;
        this.tasks = await this.teamWorkService.getTasks();
        this.total = {
            id: 0,
            name: 'Итого',
            url: null,
            time_estimated: 0,
            time_day_log: 0
        };
        for (let task of this.tasks) {
            this.total.time_estimated += task.time_estimated;
            this.total.time_day_log += task.time_day_log;
        }
    }

    public formatTime(minutes: number): string {
        if (minutes >= 0) {
            return this.toHHMM(minutes * 60);
        } else {
            return '-' + this.toHHMM(0 - minutes * 60);
        }
    }

    protected toHHMM(sec_num: number): string {
        let hours: any = Math.floor(sec_num / 3600);
        let minutes: any = Math.floor((sec_num - (hours * 3600)) / 60);
        let seconds: any = sec_num - (hours * 3600) - (minutes * 60);
        if (hours < 10) {
            hours = "0" + hours;
        }
        if (minutes < 10) {
            minutes = "0" + minutes;
        }
        if (seconds < 10) {
            seconds = "0" + seconds;
        }
        return hours + ':' + minutes;// + ':' + seconds;
    }

}
