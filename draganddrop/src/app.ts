
/* UTIL */
function autoBind(_target: any, _2methodName: string, descriptor: PropertyDescriptor)
{
  const originalMethod = descriptor.value;
  const adjustedDescriptor: PropertyDescriptor = {
    configurable: true,
    get() {
      const boundFunction = originalMethod.bind(this);
      return boundFunction;
    }
  }
  return adjustedDescriptor;
}

/* INTERFACE */
interface Validator {
  value: string | number;
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
}
interface Draggable {
  dragStartHandler(event: DragEvent): void;
  dragEndHandler(event: DragEvent): void;
}

interface DragTarget {
  dragOverHandler(event: DragEvent): void;
  dropHandler(event: DragEvent): void;
  dragLeaveHandler(event: DragEvent): void;
}

/* Project */
enum ProjectStatus { Active = 'active', Finished = 'finished'}
class Project {
  constructor(
    public id: string,
    public title: string,
    public description: string,
    public peopleAmount: number,
    public status: ProjectStatus,
  ) {}
}

/* State */
type Listener<T> = (projects: T[]) => void;
class State<T> {
  protected listeners: Listener<T>[] = [];

  public addListener(listenerFn: Listener<T>) {
    this.listeners.push(listenerFn);
  }

}
class ProjectState extends State<Project>{
  private projects: Project[] = [];
  private static instance: ProjectState;

  private constructor() {
    super();
  }

  static getInstance() {
    if (this.instance != null) {
      return this.instance;
    } else {
      this.instance = new ProjectState();
      return this.instance;
    }
  }

  public addProject(title: string, description: string, peopleAmount: number) {
    const newProject: Project = {
      id: Math.random().toString(),
      title: title,
      description: description,
      peopleAmount: peopleAmount,
      status: ProjectStatus.Active,
    }
    this.projects.push(newProject);
    this.updateListeners();
  }

  public moveProject(projectId: string, newStatus: ProjectStatus) {
    const project = this.projects.find(project => project.id === projectId);
    if(project != null && project.status !== newStatus) {
      project.status = newStatus;
      this.updateListeners();
    }
  }

  private updateListeners() {
    this.listeners.forEach((listener) => {
      listener(this.projects.slice())
    })
  }
}
const projectState = ProjectState.getInstance();

/* Component Base */
abstract class ProjectComponent<T extends HTMLElement, U extends HTMLElement> {
  public templateElement: HTMLTemplateElement;
  public hostElement: T;
  public element: U;

  constructor(templateId: string, hostElemntId: string, insertAtStart: boolean, newElementId?: string) {
    this.templateElement = document.getElementById(templateId)! as HTMLTemplateElement;
    this.hostElement = document.getElementById(hostElemntId)! as T;

    const importedNode = document.importNode(this.templateElement.content, true);
    this.element = importedNode.firstElementChild as U;
    if(newElementId != null) {
      this.element.id = newElementId;
    }

    this.attach(insertAtStart);
  }

  private attach(insertAtStart: boolean) {
    this.hostElement.insertAdjacentElement(insertAtStart ? 'afterbegin' : 'beforeend', this.element);
  }

  abstract configure(): void;
  abstract renderContent(): void;
}

/* Forms */
class ProjectInput extends ProjectComponent<HTMLDivElement, HTMLFormElement>{

  public titleInputElement: HTMLInputElement;
  public descriptionInputElement: HTMLInputElement;
  public peopleInputElement: HTMLInputElement;

  constructor() {
    super('project-input', 'app', true, 'user-input')

    this.titleInputElement = this.element.querySelector('#title') as HTMLInputElement;
    this.descriptionInputElement = this.element.querySelector('#description') as HTMLInputElement;
    this.peopleInputElement = this.element.querySelector('#people') as HTMLInputElement;

    this.configure();
  }

  public configure() {
    this.element.addEventListener('submit', this.submitHandler);
  }

  public renderContent() {}

  private validateInput(input: Validator): boolean {
    let isValid = true;
    if (input.required) {
      isValid = isValid && input.value.toString().trim().length !== 0;
    }

    if (input.minLength != null && typeof input.value === 'string') {
      isValid = isValid && input.value.length >= input.minLength;
    }

    if (input.maxLength != null && typeof input.value === 'string') {
      isValid = isValid && input.value.length <= input.maxLength;
    }

    if (input.min != null && typeof input.value === 'number') {
      isValid = isValid && input.value >= input.min
    }

    if (input.max != null && typeof input.value === 'number') {
      isValid = isValid && input.value <= input.max
    }

    return isValid;
  }

  private getUserInput(): [string, string, number] | void {
    const title = this.titleInputElement.value;
    const description = this.descriptionInputElement.value;
    const peopleAmount = this.peopleInputElement.value;

    const titleValidator: Validator = {
      value: title,
      required: true,
    }

    const descriptionValidator: Validator = {
      value: description,
      required: true,
      minLength: 5,
    }

    const peopleValidator: Validator = {
      value: +peopleAmount,
      required: true,
      min: 1,
      max: 5,
    }

    if(
      !this.validateInput(titleValidator) ||
      !this.validateInput(descriptionValidator) ||
      !this.validateInput(peopleValidator)
    ) {
      alert('Invalid Input');
      return;
    } else {
      return [title, description, +peopleAmount];
    }
  }

  @autoBind
  private submitHandler(event: Event) {
    event.preventDefault();
    const userInput = this.getUserInput();
    if (Array.isArray(userInput)) {
      const [title, description, peopleAmount] = userInput;
      projectState.addProject(title, description, peopleAmount);
      this.clearInputs();
    }
  }

  private clearInputs() {
    this.titleInputElement.value = '';
    this.descriptionInputElement.value = '';
    this.peopleInputElement.value = '';
  }
}

class ProjectList extends ProjectComponent<HTMLDivElement, HTMLElement> implements DragTarget{
  private assignedProjects: Project[];

  constructor(private type: ProjectStatus.Active | ProjectStatus.Finished) {
    super('project-list', 'app', false, `${type}-projects`);
    this.assignedProjects = [];

    this.configure();
    this.renderContent();
  }

  public configure() {
    projectState.addListener((projects: Project[]) => {
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
    projectState.moveProject(projectId, this.type);
  }

  @autoBind
  dragLeaveHandler(_: DragEvent): void {
    const listElement = this.element.querySelector('ul')!;
    listElement.classList.remove('droppable');
  }
}

class ProjectItem extends ProjectComponent<HTMLUListElement, HTMLLIElement> implements Draggable {
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
  dragEndHandler(event: DragEvent): void {
    console.log(event);
  }

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

const projectInput = new ProjectInput();
const activeProjectList = new ProjectList(ProjectStatus.Active);
const finishedProjectList = new ProjectList(ProjectStatus.Finished);
