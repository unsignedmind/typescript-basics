import { ProjectInput } from './components/project/project-input';
import { ProjectList } from './components/project/project-list';
import { ProjectStatus } from './components/project/project.model';

new ProjectInput();
new ProjectList(ProjectStatus.Active);
new ProjectList(ProjectStatus.Finished);
