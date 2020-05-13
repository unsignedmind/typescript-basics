import { ProjectComponent } from './generic/project.generic';
import { Validator } from '../../shared/interface/validator.interface';
import { autoBind } from '../../shared/util/autobind.util';
import { ProjectState } from '../../state/project.state';

export class ProjectInput extends ProjectComponent<HTMLDivElement, HTMLFormElement> {
  public titleInputElement: HTMLInputElement;
  public descriptionInputElement: HTMLInputElement;
  public peopleInputElement: HTMLInputElement;

  private projectState: ProjectState;

  constructor() {
    super('project-input', 'app', true, 'user-input');

    this.titleInputElement = this.element.querySelector('#title') as HTMLInputElement;
    this.descriptionInputElement = this.element.querySelector('#description') as HTMLInputElement;
    this.peopleInputElement = this.element.querySelector('#people') as HTMLInputElement;

    this.projectState = ProjectState.getInstance();

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
      isValid = isValid && input.value >= input.min;
    }

    if (input.max != null && typeof input.value === 'number') {
      isValid = isValid && input.value <= input.max;
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
    };

    const descriptionValidator: Validator = {
      value: description,
      required: true,
      minLength: 5,
    };

    const peopleValidator: Validator = {
      value: +peopleAmount,
      required: true,
      min: 1,
      max: 5,
    };

    if (
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
      this.projectState.addProject(title, description, peopleAmount);
      this.clearInputs();
    }
  }

  private clearInputs() {
    this.titleInputElement.value = '';
    this.descriptionInputElement.value = '';
    this.peopleInputElement.value = '';
  }
}
