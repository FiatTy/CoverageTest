import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { NodeListComponent } from './node-list.component';
import { NodeService } from '../../services/node.service';
import { Node } from '../../models/node.model';

describe('NodeListComponent', () => {
    let component: NodeListComponent;
    let fixture: ComponentFixture<NodeListComponent>;
    let mockNodeService: jasmine.SpyObj<NodeService>;
    let mockRouter: jasmine.SpyObj<Router>;

    const mockNodes: Node[] = [
        {
            id: '1',
            name: 'Test Node 1',
            description: 'Description 1',
            createdAt: new Date('2024-01-01'),
            updatedAt: new Date('2024-01-01')
        },
        {
            id: '2',
            name: 'Test Node 2',
            description: 'Description 2',
            createdAt: new Date('2024-01-02'),
            updatedAt: new Date('2024-01-02')
        }
    ];

    beforeEach(async () => {
        mockNodeService = jasmine.createSpyObj('NodeService', ['getNodes', 'deleteNode']);
        mockRouter = jasmine.createSpyObj('Router', ['navigate']);

        mockNodeService.getNodes.and.returnValue(of(mockNodes));

        await TestBed.configureTestingModule({
            imports: [NodeListComponent],
            providers: [
                { provide: NodeService, useValue: mockNodeService },
                { provide: Router, useValue: mockRouter }
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(NodeListComponent);
        component = fixture.componentInstance;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should load nodes on init', () => {
        fixture.detectChanges();
        expect(mockNodeService.getNodes).toHaveBeenCalled();
        expect(component.nodes.length).toBe(2);
        expect(component.nodes).toEqual(mockNodes);
    });

    it('should display nodes in the template', () => {
        fixture.detectChanges();
        const compiled = fixture.nativeElement;
        const rows = compiled.querySelectorAll('tbody tr');
        expect(rows.length).toBe(2);
    });

    it('should display node data correctly', () => {
        fixture.detectChanges();
        const compiled = fixture.nativeElement;
        const firstRow = compiled.querySelector('tbody tr:first-child');
        expect(firstRow.textContent).toContain('Test Node 1');
        expect(firstRow.textContent).toContain('Description 1');
    });

    it('should navigate to create page when onCreateNode is called', () => {
        component.onCreateNode();
        expect(mockRouter.navigate).toHaveBeenCalledWith(['/nodes/new']);
    });

    it('should navigate to edit page when onEditNode is called', () => {
        component.onEditNode('1');
        expect(mockRouter.navigate).toHaveBeenCalledWith(['/nodes/edit', '1']);
    });

    it('should call deleteNode when confirmed', () => {
        spyOn(window, 'confirm').and.returnValue(true);
        mockNodeService.deleteNode.and.returnValue(of(undefined));

        component.onDeleteNode('1');

        expect(window.confirm).toHaveBeenCalledWith('Are you sure you want to delete this node?');
        expect(mockNodeService.deleteNode).toHaveBeenCalledWith('1');
    });

    it('should not call deleteNode when not confirmed', () => {
        spyOn(window, 'confirm').and.returnValue(false);

        component.onDeleteNode('1');

        expect(window.confirm).toHaveBeenCalled();
        expect(mockNodeService.deleteNode).not.toHaveBeenCalled();
    });

    it('should handle delete error', () => {
        spyOn(window, 'confirm').and.returnValue(true);
        spyOn(window, 'alert');
        spyOn(console, 'error');
        mockNodeService.deleteNode.and.returnValue(throwError(() => new Error('Delete failed')));

        component.onDeleteNode('1');

        expect(console.error).toHaveBeenCalled();
        expect(window.alert).toHaveBeenCalledWith('Failed to delete node');
    });

    it('should format date correctly', () => {
        const date = new Date('2024-01-15');
        const formatted = component.formatDate(date);
        expect(formatted).toBeTruthy();
        expect(typeof formatted).toBe('string');
    });

    it('should display "no data" message when nodes array is empty', () => {
        mockNodeService.getNodes.and.returnValue(of([]));
        fixture.detectChanges();

        const compiled = fixture.nativeElement;
        const noDataCell = compiled.querySelector('.no-data');
        expect(noDataCell).toBeTruthy();
        expect(noDataCell.textContent).toContain('No nodes available');
    });

    it('should unsubscribe on destroy', () => {
        spyOn(component['destroy$'], 'next');
        spyOn(component['destroy$'], 'complete');

        component.ngOnDestroy();

        expect(component['destroy$'].next).toHaveBeenCalled();
        expect(component['destroy$'].complete).toHaveBeenCalled();
    });

    it('should call loadNodes method', () => {
        spyOn(component, 'loadNodes');
        component.ngOnInit();
        expect(component.loadNodes).toHaveBeenCalled();
    });
});
