import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { ColDef, ColumnApi, GridApi } from "ag-grid-community";
import { Amc, User } from "../_models";
import { AccountService } from "../_services";
import { BrandService } from "../_services/brand.service";

@Component({
    selector: "CreateBrand",
    templateUrl: "./brandlist.component.html"
})

export class BrandListComponent implements OnInit {

    user: User;
    BrandList: any;
    hasAddAccess: boolean = false;
    hasDeleteAccess: boolean = false;
    public columnDefs: any
    private columnApi: ColumnApi;
    private api: GridApi;

    constructor(
        private router: Router,
        private accountService: AccountService,
        private BrandService: BrandService,
    ) { }

    async ngOnInit() {
        this.user = this.accountService.userValue;

        if (this.user.username == "admin") {
            this.hasAddAccess = true;
            this.hasDeleteAccess = true;
        }

        var data: any = await this.BrandService.GetByCompanyId().toPromise()

        this.BrandList = data.object;
        this.columnDefs = this.createColumnDefs();
    }

    Add() {
        this.router.navigate(['brand']);
    }


    EditRecord() {
        var data = this.api.getSelectedRows()[0]
        this.router.navigate([`brand/${data.id}`])
    }

    private createColumnDefs() {
        return [
            {
                headerName: 'Company',
                field: 'companyName',
                filter: true,
                enableSorting: true,
                editable: false,
                sortable: true,
                tooltipField: 'companyName',
            },
            {
                headerName: 'Brand Name',
                field: 'brandName',
                filter: true,
                sortable: true,
                tooltipField: "brandName",
                width: "1000"
            },
        ]
    }

    onGridReady(params): void {
        this.api = params.api;
        this.columnApi = params.columnApi;
    }

}
