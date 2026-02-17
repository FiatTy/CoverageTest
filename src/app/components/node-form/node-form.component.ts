import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { NodeService } from '../../services/node.service';

@Component({
    selector: 'app-node-form',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './node-form.component.html',
    styleUrls: ['./node-form.component.css']
})
export class NodeFormComponent implements OnInit, OnDestroy {
    nodeForm: FormGroup;
    isEditMode = false;
    nodeId: string | null = null;
    private destroy$ = new Subject<void>();

    constructor(
        private fb: FormBuilder,
        private nodeService: NodeService,
        private router: Router,
        private route: ActivatedRoute
    ) {
        this.nodeForm = this.fb.group({
            name: ['', [Validators.required, Validators.minLength(3)]],
            description: ['', [Validators.required, Validators.minLength(5)]]
        });
    }

    ngOnInit(): void {
        this.nodeId = this.route.snapshot.paramMap.get('id');

        if (this.nodeId) {
            this.isEditMode = true;
            this.loadNode(this.nodeId);
        }
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    loadNode(id: string): void {
        this.nodeService.getNode(id)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (node) => {
                    this.nodeForm.patchValue({
                        name: node.name,
                        description: node.description
                    });
                },
                error: (error) => {
                    console.error('Error loading node:', error);
                    alert('Failed to load node');
                    this.router.navigate(['/nodes']);
                }
            });
    }

    onSubmit(): void {
        if (this.nodeForm.invalid) {
            this.markFormGroupTouched(this.nodeForm);
            return;
        }

        const formValue = this.nodeForm.value;

        if (this.isEditMode && this.nodeId) {
            this.nodeService.updateNode(this.nodeId, formValue)
                .pipe(takeUntil(this.destroy$))
                .subscribe({
                    next: () => {
                        this.router.navigate(['/nodes']);
                    },
                    error: (error) => {
                        console.error('Error updating node:', error);
                        alert('Failed to update node');
                    }
                });
        } else {
            this.nodeService.createNode(formValue)
                .pipe(takeUntil(this.destroy$))
                .subscribe({
                    next: () => {
                        this.router.navigate(['/nodes']);
                    },
                    error: (error) => {
                        console.error('Error creating node:', error);
                        alert('Failed to create node');
                    }
                });
        }
    }

    onCancel(): void {
        this.router.navigate(['/nodes']);
    }

    private markFormGroupTouched(formGroup: FormGroup): void {
        Object.keys(formGroup.controls).forEach(key => {
            const control = formGroup.get(key);
            control?.markAsTouched();
        });
    }

    get name() {
        return this.nodeForm.get('name');
    }

    get description() {
        return this.nodeForm.get('description');
    }
}
