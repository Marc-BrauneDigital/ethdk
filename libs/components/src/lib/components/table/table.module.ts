import { NgModule } from '@angular/core';
import { TableComponent } from './components';
import {
  RecycleRowsDirective,
  HeaderCellDefDirective,
  HeaderRowDefDirective,
  ColumnDefDirective,
  CellDefDirective,
  RowDefDirective,
  FooterCellDefDirective,
  FooterRowDefDirective,
  HeaderCellDirective,
  CellDirective,
  FooterCellDirective,
  HeaderRowComponent,
  RowComponent,
  FooterRowComponent,
  NoDataRowDirective,
  TextColumnComponent,
  TableBusyDirective,
} from './partials';

@NgModule({
  imports: [
    TableComponent,
    RecycleRowsDirective,
    HeaderCellDefDirective,
    HeaderRowDefDirective,
    ColumnDefDirective,
    CellDefDirective,
    RowDefDirective,
    FooterCellDefDirective,
    FooterRowDefDirective,
    HeaderCellDirective,
    CellDirective,
    FooterCellDirective,
    HeaderRowComponent,
    RowComponent,
    FooterRowComponent,
    NoDataRowDirective,
    TextColumnComponent,
    TableBusyDirective,
  ],
  exports: [
    TableComponent,
    RecycleRowsDirective,
    HeaderCellDefDirective,
    HeaderRowDefDirective,
    ColumnDefDirective,
    CellDefDirective,
    RowDefDirective,
    FooterCellDefDirective,
    FooterRowDefDirective,
    HeaderCellDirective,
    CellDirective,
    FooterCellDirective,
    HeaderRowComponent,
    RowComponent,
    FooterRowComponent,
    NoDataRowDirective,
    TextColumnComponent,
    TableBusyDirective,
  ],
})
export class TableModule {}
