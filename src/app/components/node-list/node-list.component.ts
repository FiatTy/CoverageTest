import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { NodeService } from '../../services/node.service';
import { Node } from '../../models/node.model';

@Component({
    selector: 'app-node-list',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './node-list.component.html',
    styleUrls: ['./node-list.component.css']
})
export class NodeListComponent implements OnInit, OnDestroy {
    nodes: Node[] = [];
    private destroy$ = new Subject<void>();

    constructor(
        private nodeService: NodeService,
        private router: Router
    ) { }

    ngOnInit(): void {
        this.loadNodes();
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    loadNodes(): void {
        this.nodeService.getNodes()
            .pipe(takeUntil(this.destroy$))
            .subscribe(nodes => {
                this.nodes = nodes;
            });
    }

    onCreateNode(): void {
        this.router.navigate(['/nodes/new']);
    }

    onEditNode(id: string): void {
        this.router.navigate(['/nodes/edit', id]);
    }

    onDeleteNode(id: string): void {
        if (confirm('Are you sure you want to delete this node?')) {
            this.nodeService.deleteNode(id)
                .pipe(takeUntil(this.destroy$))
                .subscribe({
                    next: () => {
                        // Node list will update automatically via the observable
                    },
                    error: (error) => {
                        console.error('Error deleting node:', error);
                        alert('Failed to delete node');
                    }
                });
        }
    }

    formatDate(date: Date): string {
        return new Date(date).toLocaleDateString();
    }
}
