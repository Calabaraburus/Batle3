import { validPunctualLightsCulling, _decorator } from "cc";
import { Service } from "./Service";
const { ccclass } = _decorator;

@ccclass("JobsService")
export class JobsService extends Service {
  private _jobs = new Map<string, Array<JobBase>>();

  public AddJob(job: JobBase) {}

  public RemoveJob(job: JobBase) {
    if (this._jobs.has(job.jobPath)) {
    }
  }
}

export class JobBase {
  private _repeatCount = 1;
  public get repeatCount(): number {
    return this._repeatCount;
  }

  private _mainService: JobsService;
  public get mainService(): JobsService {
    return this._mainService;
  }

  public set mainService(value: JobsService) {
    this._mainService = value;
  }

  private _jobPath: string;
  public get jobPath(): string {
    return this._jobPath;
  }

  execute() {
    return;
  }
}
