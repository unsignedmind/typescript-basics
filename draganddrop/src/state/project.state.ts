import { State } from './generic/state';
import { Project, ProjectStatus } from '../components/project/project.model';

export class ProjectState extends State<Project>{
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