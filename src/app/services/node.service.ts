import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { map } from 'rxjs/operators';
import { Node } from '../models/node.model';

@Injectable({
    providedIn: 'root'
})
export class NodeService {
    private nodes: Node[] = [];
    private nodesSubject = new BehaviorSubject<Node[]>([]);

    constructor() {
        // Initialize with some sample data
        this.nodes = [
            {
                id: '1',
                name: 'Node 1',
                description: 'First sample node',
                createdAt: new Date('2024-01-01'),
                updatedAt: new Date('2024-01-01')
            },
            {
                id: '2',
                name: 'Node 2',
                description: 'Second sample node',
                createdAt: new Date('2024-01-02'),
                updatedAt: new Date('2024-01-02')
            }
        ];
        this.nodesSubject.next(this.nodes);
    }

    getNodes(): Observable<Node[]> {
        return this.nodesSubject.asObservable();
    }

    getNode(id: string): Observable<Node> {
        return this.nodesSubject.pipe(
            map(nodes => {
                const node = nodes.find(n => n.id === id);
                if (!node) {
                    throw new Error(`Node with id ${id} not found`);
                }
                return node;
            })
        );
    }

    createNode(node: Omit<Node, 'id' | 'createdAt' | 'updatedAt'>): Observable<Node> {
        const newNode: Node = {
            ...node,
            id: this.generateId(),
            createdAt: new Date(),
            updatedAt: new Date()
        };

        this.nodes.push(newNode);
        this.nodesSubject.next([...this.nodes]);

        return new BehaviorSubject(newNode).asObservable();
    }

    updateNode(id: string, nodeData: Partial<Omit<Node, 'id' | 'createdAt'>>): Observable<Node> {
        const index = this.nodes.findIndex(n => n.id === id);

        if (index === -1) {
            return throwError(() => new Error(`Node with id ${id} not found`));
        }

        const updatedNode: Node = {
            ...this.nodes[index],
            ...nodeData,
            updatedAt: new Date()
        };

        this.nodes[index] = updatedNode;
        this.nodesSubject.next([...this.nodes]);

        return new BehaviorSubject(updatedNode).asObservable();
    }

    deleteNode(id: string): Observable<void> {
        const index = this.nodes.findIndex(n => n.id === id);

        if (index === -1) {
            return throwError(() => new Error(`Node with id ${id} not found`));
        }

        this.nodes.splice(index, 1);
        this.nodesSubject.next([...this.nodes]);

        return new BehaviorSubject<void>(undefined).asObservable();
    }

    private generateId(): string {
        return Date.now().toString() + Math.random().toString(36).substr(2, 9);
    }
}
