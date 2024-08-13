import { AfterViewInit, Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss']
})
export class TableComponent<T> implements OnInit, AfterViewInit, OnChanges {
  @Input() data: T[] = [];
  @Input() columns: { columnDef: string, header: string, cell: (element: T) => string | number }[] = [];
  @Input() actions: { name: string, event: string, icon: string }[] = [];
  @Output() actionTriggered = new EventEmitter<{ event: string, element: T }>();

  displayedColumns: string[] = [];
  dataSource = new MatTableDataSource<T>();

  @ViewChild(MatPaginator) paginator: MatPaginator | undefined;
  @ViewChild(MatSort) sort: MatSort | undefined;

  pageSize = 10;
  pageSizeOptions = [5, 10, 20, 50];

  ngOnInit(): void {
    this.displayedColumns = this.columns.map(c => c.columnDef);
    if (this.actions.length > 0) {
      this.displayedColumns.push('actions');
    }
    this.dataSource.data = this.data;
  }

  ngAfterViewInit(): void {
    if (this.paginator) {
      this.dataSource.paginator = this.paginator;
    }
    if (this.sort) {
      this.dataSource.sort = this.sort;
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data']) {
      this.dataSource.data = this.data;
    }
  }

  triggerAction(event: string, element: T): void {
    this.actionTriggered.emit({ event, element });
  }
}
