import './popup.scss';
import { LayoutComponent } from "./component/layout.component";

/*jQuery.ajax('https://athome4.teamwork.com/projects/api/v2/projects/300254/tasks.json?tagIds=45178&matchAllTags=true')
    .done(data => {
        console.log(data);
    });*/

new LayoutComponent({
    el: '#app'
});
