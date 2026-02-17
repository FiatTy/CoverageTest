import { TestBed } from '@angular/core/testing';
import { NodeService } from './node.service';
import { Node } from '../models/node.model';

describe('NodeService', () => {
    let service: NodeService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(NodeService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    describe('getNodes', () => {
        it('should return an observable of nodes', (done) => {
            service.getNodes().subscribe(nodes => {
                expect(nodes).toBeDefined();
                expect(nodes.length).toBeGreaterThan(0);
                done();
            });
        });

        it('should return initial sample nodes', (done) => {
            service.getNodes().subscribe(nodes => {
                expect(nodes.length).toBe(2);
                expect(nodes[0].name).toBe('Node 1');
                expect(nodes[1].name).toBe('Node 2');
                done();
            });
        });
    });

    describe('getNode', () => {
        it('should return a specific node by id', (done) => {
            service.getNode('1').subscribe(node => {
                expect(node).toBeDefined();
                expect(node.id).toBe('1');
                expect(node.name).toBe('Node 1');
                done();
            });
        });

        it('should throw error for non-existent node', (done) => {
            service.getNode('999').subscribe({
                next: () => fail('Should have thrown an error'),
                error: (error) => {
                    expect(error.message).toContain('not found');
                    done();
                }
            });
        });
    });

    describe('createNode', () => {
        it('should create a new node', (done) => {
            const newNode = {
                name: 'Test Node',
                description: 'Test Description'
            };

            service.createNode(newNode).subscribe(createdNode => {
                expect(createdNode).toBeDefined();
                expect(createdNode.id).toBeDefined();
                expect(createdNode.name).toBe('Test Node');
                expect(createdNode.description).toBe('Test Description');
                expect(createdNode.createdAt).toBeDefined();
                expect(createdNode.updatedAt).toBeDefined();
                done();
            });
        });

        it('should add the new node to the nodes list', (done) => {
            const newNode = {
                name: 'Another Node',
                description: 'Another Description'
            };

            service.createNode(newNode).subscribe(() => {
                service.getNodes().subscribe(nodes => {
                    expect(nodes.length).toBe(3);
                    const addedNode = nodes.find(n => n.name === 'Another Node');
                    expect(addedNode).toBeDefined();
                    done();
                });
            });
        });

        it('should generate unique ids for multiple nodes', (done) => {
            const node1 = { name: 'Node A', description: 'Description A' };
            const node2 = { name: 'Node B', description: 'Description B' };

            service.createNode(node1).subscribe(created1 => {
                service.createNode(node2).subscribe(created2 => {
                    expect(created1.id).not.toBe(created2.id);
                    done();
                });
            });
        });
    });

    describe('updateNode', () => {
        it('should update an existing node', (done) => {
            const updates = {
                name: 'Updated Node',
                description: 'Updated Description'
            };

            service.updateNode('1', updates).subscribe(updatedNode => {
                expect(updatedNode).toBeDefined();
                expect(updatedNode.id).toBe('1');
                expect(updatedNode.name).toBe('Updated Node');
                expect(updatedNode.description).toBe('Updated Description');
                done();
            });
        });

        it('should update the updatedAt timestamp', (done) => {
            const originalDate = new Date('2024-01-01');

            service.updateNode('1', { name: 'New Name' }).subscribe(updatedNode => {
                expect(updatedNode.updatedAt.getTime()).toBeGreaterThan(originalDate.getTime());
                done();
            });
        });

        it('should throw error when updating non-existent node', (done) => {
            service.updateNode('999', { name: 'Test' }).subscribe({
                next: () => fail('Should have thrown an error'),
                error: (error) => {
                    expect(error.message).toContain('not found');
                    done();
                }
            });
        });

        it('should preserve createdAt when updating', (done) => {
            service.getNode('1').subscribe(originalNode => {
                const originalCreatedAt = originalNode.createdAt;

                service.updateNode('1', { name: 'Updated' }).subscribe(updatedNode => {
                    expect(updatedNode.createdAt).toEqual(originalCreatedAt);
                    done();
                });
            });
        });
    });

    describe('deleteNode', () => {
        it('should delete an existing node', (done) => {
            service.deleteNode('1').subscribe(() => {
                service.getNodes().subscribe(nodes => {
                    expect(nodes.length).toBe(1);
                    expect(nodes.find(n => n.id === '1')).toBeUndefined();
                    done();
                });
            });
        });

        it('should throw error when deleting non-existent node', (done) => {
            service.deleteNode('999').subscribe({
                next: () => fail('Should have thrown an error'),
                error: (error) => {
                    expect(error.message).toContain('not found');
                    done();
                }
            });
        });

        it('should not affect other nodes when deleting', (done) => {
            service.deleteNode('1').subscribe(() => {
                service.getNodes().subscribe(nodes => {
                    expect(nodes.length).toBe(1);
                    expect(nodes[0].id).toBe('2');
                    expect(nodes[0].name).toBe('Node 2');
                    done();
                });
            });
        });
    });
});
