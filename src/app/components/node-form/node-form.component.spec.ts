import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { of, throwError } from 'rxjs';
import { NodeFormComponent } from './node-form.component';
import { NodeService } from '../../services/node.service';
import { Node } from '../../models/node.model';

describe('NodeFormComponent', () => {
    let component: NodeFormComponent;
    let fixture: ComponentFixture<NodeFormComponent>;
    let mockNodeService: jasmine.SpyObj<NodeService>;
    let mockRouter: jasmine.SpyObj<Router>;
    let mockActivatedRoute: any;

    const mockNode: Node = {
        id: '1',
        name: 'Test Node',
        description: 'Test Description',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01')
    };

    beforeEach(async () => {
        mockNodeService = jasmine.createSpyObj('NodeService', ['getNode', 'createNode', 'updateNode']);
        mockRouter = jasmine.createSpyObj('Router', ['navigate']);
        mockActivatedRoute = {
            snapshot: {
                paramMap: {
                    get: jasmine.createSpy('get').and.returnValue(null)
                }
            }
        };

        await TestBed.configureTestingModule({
            imports: [NodeFormComponent, ReactiveFormsModule],
            providers: [
                { provide: NodeService, useValue: mockNodeService },
                { provide: Router, useValue: mockRouter },
                { provide: ActivatedRoute, useValue: mockActivatedRoute }
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(NodeFormComponent);
        component = fixture.componentInstance;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should initialize form with empty values in create mode', () => {
        fixture.detectChanges();
        expect(component.isEditMode).toBe(false);
        expect(component.nodeForm.get('name')?.value).toBe('');
        expect(component.nodeForm.get('description')?.value).toBe('');
    });

    it('should load node in edit mode', () => {
        mockActivatedRoute.snapshot.paramMap.get.and.returnValue('1');
        mockNodeService.getNode.and.returnValue(of(mockNode));

        fixture.detectChanges();

        expect(component.isEditMode).toBe(true);
        expect(component.nodeId).toBe('1');
        expect(mockNodeService.getNode).toHaveBeenCalledWith('1');
    });

    it('should populate form with node data in edit mode', (done) => {
        mockActivatedRoute.snapshot.paramMap.get.and.returnValue('1');
        mockNodeService.getNode.and.returnValue(of(mockNode));

        fixture.detectChanges();

        setTimeout(() => {
            expect(component.nodeForm.get('name')?.value).toBe('Test Node');
            expect(component.nodeForm.get('description')?.value).toBe('Test Description');
            done();
        }, 100);
    });

    it('should validate required fields', () => {
        fixture.detectChanges();
        const nameControl = component.nodeForm.get('name');
        const descriptionControl = component.nodeForm.get('description');

        expect(nameControl?.valid).toBe(false);
        expect(descriptionControl?.valid).toBe(false);

        nameControl?.setValue('Test');
        descriptionControl?.setValue('Test Description');

        expect(nameControl?.valid).toBe(true);
        expect(descriptionControl?.valid).toBe(true);
    });

    it('should validate minimum length', () => {
        fixture.detectChanges();
        const nameControl = component.nodeForm.get('name');
        const descriptionControl = component.nodeForm.get('description');

        nameControl?.setValue('AB');
        descriptionControl?.setValue('Test');

        expect(nameControl?.errors?.['minlength']).toBeTruthy();
        expect(descriptionControl?.errors?.['minlength']).toBeTruthy();

        nameControl?.setValue('ABC');
        descriptionControl?.setValue('Test Description');

        expect(nameControl?.errors).toBeNull();
        expect(descriptionControl?.errors).toBeNull();
    });

    it('should create node when form is submitted in create mode', () => {
        mockNodeService.createNode.and.returnValue(of(mockNode));
        fixture.detectChanges();

        component.nodeForm.setValue({
            name: 'New Node',
            description: 'New Description'
        });

        component.onSubmit();

        expect(mockNodeService.createNode).toHaveBeenCalledWith({
            name: 'New Node',
            description: 'New Description'
        });
        expect(mockRouter.navigate).toHaveBeenCalledWith(['/nodes']);
    });

    it('should update node when form is submitted in edit mode', () => {
        mockActivatedRoute.snapshot.paramMap.get.and.returnValue('1');
        mockNodeService.getNode.and.returnValue(of(mockNode));
        mockNodeService.updateNode.and.returnValue(of(mockNode));

        fixture.detectChanges();

        component.nodeForm.setValue({
            name: 'Updated Node',
            description: 'Updated Description'
        });

        component.onSubmit();

        expect(mockNodeService.updateNode).toHaveBeenCalledWith('1', {
            name: 'Updated Node',
            description: 'Updated Description'
        });
        expect(mockRouter.navigate).toHaveBeenCalledWith(['/nodes']);
    });

    it('should not submit if form is invalid', () => {
        fixture.detectChanges();
        component.onSubmit();

        expect(mockNodeService.createNode).not.toHaveBeenCalled();
        expect(mockNodeService.updateNode).not.toHaveBeenCalled();
    });

    it('should navigate to nodes list on cancel', () => {
        component.onCancel();
        expect(mockRouter.navigate).toHaveBeenCalledWith(['/nodes']);
    });

    it('should handle create error', () => {
        spyOn(window, 'alert');
        spyOn(console, 'error');
        mockNodeService.createNode.and.returnValue(throwError(() => new Error('Create failed')));

        fixture.detectChanges();

        component.nodeForm.setValue({
            name: 'New Node',
            description: 'New Description'
        });

        component.onSubmit();

        expect(console.error).toHaveBeenCalled();
        expect(window.alert).toHaveBeenCalledWith('Failed to create node');
    });

    it('should handle update error', () => {
        spyOn(window, 'alert');
        spyOn(console, 'error');
        mockActivatedRoute.snapshot.paramMap.get.and.returnValue('1');
        mockNodeService.getNode.and.returnValue(of(mockNode));
        mockNodeService.updateNode.and.returnValue(throwError(() => new Error('Update failed')));

        fixture.detectChanges();

        component.nodeForm.setValue({
            name: 'Updated Node',
            description: 'Updated Description'
        });

        component.onSubmit();

        expect(console.error).toHaveBeenCalled();
        expect(window.alert).toHaveBeenCalledWith('Failed to update node');
    });

    it('should handle load node error', () => {
        spyOn(window, 'alert');
        spyOn(console, 'error');
        mockActivatedRoute.snapshot.paramMap.get.and.returnValue('1');
        mockNodeService.getNode.and.returnValue(throwError(() => new Error('Load failed')));

        fixture.detectChanges();

        expect(console.error).toHaveBeenCalled();
        expect(window.alert).toHaveBeenCalledWith('Failed to load node');
        expect(mockRouter.navigate).toHaveBeenCalledWith(['/nodes']);
    });

    it('should mark form as touched when submitting invalid form', () => {
        fixture.detectChanges();
        component.onSubmit();

        expect(component.nodeForm.get('name')?.touched).toBe(true);
        expect(component.nodeForm.get('description')?.touched).toBe(true);
    });

    it('should unsubscribe on destroy', () => {
        spyOn(component['destroy$'], 'next');
        spyOn(component['destroy$'], 'complete');

        component.ngOnDestroy();

        expect(component['destroy$'].next).toHaveBeenCalled();
        expect(component['destroy$'].complete).toHaveBeenCalled();
    });

    it('should have name getter', () => {
        expect(component.name).toBe(component.nodeForm.get('name'));
    });

    it('should have description getter', () => {
        expect(component.description).toBe(component.nodeForm.get('description'));
    });
});
