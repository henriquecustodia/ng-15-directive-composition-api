import { NgIf } from '@angular/common';
import {
  Component,
  ElementRef,
  EventEmitter,
  inject,
  Input,
  OnDestroy,
  OnInit,
  Output,
  Renderer2,
} from '@angular/core';
import { Directive } from '@angular/core';
import { interval, map, startWith, Subject, tap } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Directive({
  selector: 'onDestroy',
  standalone: true,
})
export class OnDestroyDirective implements OnDestroy {
  private _destroy$ = new Subject();

  get destroy$() {
    return this._destroy$.asObservable();
  }

  ngOnDestroy(): void {
    this._destroy$.next(true);
    this._destroy$.complete();
  }
}

@Directive({
  selector: 'box',
  standalone: true,
})
export class BoxDirective implements OnInit {
  renderer = inject(Renderer2);
  hostEl = inject(ElementRef).nativeElement;

  @Input() color = 'green';

  @Output() click = new EventEmitter();

  ngOnInit(): void {
    this.renderer.setStyle(this.hostEl, 'display', 'block');
    console.log(this.color);
    this.renderer.setStyle(this.hostEl, 'color', this.color);
    this.renderer.setStyle(this.hostEl, 'border', `1px solid black`);
    this.renderer.setStyle(this.hostEl, 'padding', '8px');
  }
}

@Component({
  selector: 'app-timer',
  standalone: true,
  hostDirectives: [
    {
      directive: BoxDirective,
      inputs: ['color'],
    },
    OnDestroyDirective,
  ],
  template: `{{ timer }}`,
})
export class TimerComponent implements OnInit {
  destroy$ = inject(OnDestroyDirective).destroy$;

  timer: number = 0;

  interval$ = interval(1000).pipe(
    takeUntil(this.destroy$),
    map((value) => value + 1),
    tap((value) => console.log(`timer: ${value}`))
  );

  ngOnInit(): void {
    this.interval$.subscribe((value) => {
      this.timer = value;
    });
  }
}

@Component({
  selector: 'app-text',
  standalone: true,
  hostDirectives: [
    {
      directive: BoxDirective,
      inputs: ['color: customColor'],
    },
  ],
  template: `
    Red text!    
  `,
})
export class TextComponent {}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [TextComponent, TimerComponent, NgIf],
  template: `
    <div>Text</div>
    <app-text customColor="purple"></app-text>
    
    <br />

    <div>Timer</div>
    <ng-container *ngIf="showTimer">
      <app-timer color="blue"></app-timer>
    </ng-container>
    <button (click)="onKillTimer()">Kill it</button>
  `,
})
export class AppComponent {
  showTimer = true;

  onKillTimer() {
    this.showTimer = false;
  }
}
