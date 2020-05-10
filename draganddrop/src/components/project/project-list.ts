import { ProjectComponent } from './generic/project.generic';
import { DragTarget } from '../../shared/interface/drag-drop.interface';
import { Project, ProjectStatus } from './project.model';
import { autoBind } from '../../shared/util/autobind.util';
import { ProjectItem } from './project-item';
import { ProjectState } from '../../state/project.state';

export class ProjectList extends ProjectComponent<HTMLDivElement, HTMLElement> implements DragTarget{
  private assignedProjects: Project[];
  private projectState: ProjectState;

  constructor(private type: ProjectStatus.Active | ProjectStatus.Finished) {
    super('project-list', 'app', false, `${type}-projects`);
    this.assignedProjects = [];
    this.projectState = ProjectState.getInstance();

    this.configure();
    this.renderContent();
  }

  public configure() {
    this.projectState.addListener((projects: Project[]) => {
      this.assignedProjects = projects.filter(project => {
        if (this.type === ProjectStatus.Active) {
          return project.status === ProjectStatus.Active;
        } else {
          return project.status === ProjectStatus.Finished;
        }
      });
      this.renderProjects();
    })

    this.element.addEventListener('dragover', this.dragOverHandler);
    this.element.addEventListener('dragleave', this.dragLeaveHandler);
    this.element.addEventListener('drop', this.dropHandler);
  }

  public renderContent() {
    const listId = `${this.type}-projects-list`;
    this.element.querySelector('ul')!.id = listId;
    this.element.querySelector('h2')!.textContent = this.type.toUpperCase() + ' PROJECTS';
  }

  private renderProjects() {
    const listElement = document.getElementById(`${this.type}-projects-list`)! as HTMLUListElement;
    listElement.innerHTML = '';
    this.assignedProjects.forEach((project) => {
      new ProjectItem(this.element.querySelector('ul')!.id, project);
    })
  }

  @autoBind
  dragOverHandler(event: DragEvent): void {
    if(event.dataTransfer && event.dataTransfer.types[0] === 'text/plain') {
      event.preventDefault();
      const listElement = this.element.querySelector('ul')!;
      listElement.classList.add('droppable');
    }
  }

  @autoBind
  dropHandler(event: DragEvent): void {
    const projectId = event.dataTransfer!.getData('text/plain');
    this.projectState.moveProject(projectId, this.type);
  }

  @autoBind
  dragLeaveHandler(_: DragEvent): void {
    const listElement = this.element.querySelector('ul')!;
    listElement.classList.remove('droppable');
  }
}