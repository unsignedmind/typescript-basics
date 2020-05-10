import { ProjectComponent } from './generic/project.generic';
import { Draggable } from '../../shared/interface/drag-drop.interface';
import { Project } from './project.model';
import { autoBind } from '../../shared/util/autobind.util';

export class ProjectItem extends ProjectComponent<HTMLUListElement, HTMLLIElement> implements Draggable {
  private project: Project;

  get persons() {
    if (this.project.peopleAmount === 1) {
      return `1 person`
    } else {
      return `${this.project.peopleAmount} persons`
    }
  }

  constructor(hostId: string, project: Project) {
    super('single-project', hostId, false, project.id);
    this.project = project;

    this.configure();
    this.renderContent();
  }

  public renderContent() {
    this.element.querySelector('h2')!.textContent = this.project.title
    this.element.querySelector('h3')!.textContent = `${this.persons} assigned`;
    this.element.querySelector('p')!.textContent = this.project.description;
  }

  @autoBind
  dragEndHandler(_: DragEvent): void {}

  @autoBind
  dragStartHandler(event: DragEvent): void {
    event.dataTransfer!.setData('text/plain', this.project.id);
    event.dataTransfer!.effectAllowed = 'move';
  }

  public configure() {
    this.element.addEventListener('dragstart', this.dragStartHandler);
    this.element.addEventListener('dragend', this.dragEndHandler);
  }
}