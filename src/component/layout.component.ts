import Component from "vue-class-component";
import Vue from "vue";
import { LoginRequiredComponent } from "./login-required.component";
import { TeamWorkService } from "teamwork/teamwork.service";
import { TasksComponent } from "./tasks.component";

let teamWorkService = new TeamWorkService();

export enum State {
    Loading = 'loading',
    LoginRequired = 'login-required',
    Tasks = 'tasks'
}

@Component({
    template: require('./layout.component.html'),
    provide: {
        teamWorkService: teamWorkService
    },
    components: {
        'login-required': LoginRequiredComponent,
        'tasks': TasksComponent
    }
})
export class LayoutComponent extends Vue {
    public state = State.Loading;

    public async created(): Promise<void> {
        await teamWorkService.init();
        this.state = await teamWorkService.isAuthenticated() ? State.Tasks : State.LoginRequired;
    }

}
