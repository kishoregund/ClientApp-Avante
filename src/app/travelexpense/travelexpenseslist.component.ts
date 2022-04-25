import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { ColDef, ColumnApi, GridApi } from "ag-grid-community";
import { BsModalRef, BsModalService } from "ngx-bootstrap/modal";
import { first } from "rxjs/operators";
import { RenderComponent } from "../distributor/rendercomponent";
import { ImportDataComponent } from "../importdata/import.component";
import { ProfileReadOnly, User } from "../_models";
import { AccountService, TravelDetailService, NotificationService, ProfileService, DistributorService, ListTypeService } from "../_services";
import { TravelExpenseService } from "../_services/travel-expense.service";

@Component({
    selector: 'app-travelexpense',
    templateUrl: './travelexpenselist.compoent.html',
    styleUrls: ['./travelexpense.component.css']
})

export class TravelexpenseListComponent implements OnInit {

    public columnDefs: ColDef[];
    private columnApi: ColumnApi;
    private api: GridApi;
    profilePermission: ProfileReadOnly;
    hasReadAccess: boolean = false;
    hasUpdateAccess: boolean = false;
    hasDeleteAccess: boolean = false;
    hasAddAccess: boolean = false;
    user: User;
    bsModalRef: BsModalRef;

    List: any;
    constructor(
        private router: Router,
        private accountService: AccountService,
        private Service: TravelExpenseService,
        private notificationService: NotificationService,
        private profileService: ProfileService,
        private modalService: BsModalService,
        private listTypeService: ListTypeService,
    ) { }

    ngOnInit(): void {
        this.user = this.accountService.userValue;
        let role;
        this.profilePermission = this.profileService.userProfileValue;
        if (this.profilePermission != null) {
            let profilePermission = this.profilePermission.permissions.filter(
                (x) => x.screenCode == "TREXP"
            );
            if (profilePermission.length > 0) {
                this.hasReadAccess = profilePermission[0].read;
                this.hasAddAccess = profilePermission[0].create;
                this.hasDeleteAccess = profilePermission[0].delete;
                this.hasUpdateAccess = profilePermission[0].update;
            }
        }
        if (this.user.username == "admin") {
            this.hasAddAccess = true;
            this.hasDeleteAccess = true;
            this.hasUpdateAccess = true;
            this.hasReadAccess = true;
        } else {
            role = JSON.parse(localStorage.getItem('roles'));
            role = role[0].itemCode;
        }

        this.Service.getAll().pipe(first())
            .subscribe((data: any) => this.List = data.object)

        this.columnDefs = this.createColumnDefs();
    }

    Add() {
        this.router.navigate(["travelexpense"]);
    }

    private createColumnDefs() {
        return [
            {
                headerName: "Action",
                field: "id",
                filter: false,
                enableSorting: false,
                editable: false,
                sortable: false,
                cellRendererFramework: RenderComponent,
                cellRendererParams: {
                    inRouterLink: "/travelexpense",
                    deleteLink: "TREXP",
                    deleteaccess: this.hasDeleteAccess,
                },
            },
            {
                headerName: "Engineer ",
                field: "engineerName",
                filter: true,
                enableSorting: true,
                editable: false,
                sortable: true,
                tooltipField: "name",
            },
            {
                headerName: "Service Request No",
                field: "serviceRequestNo",
                filter: true,
                editable: false,
                sortable: true,
                tooltipField: "code",
            },
            {
                headerName: "Start Date",
                field: "startDate",
                filter: true,
                editable: false,
                sortable: true,
                tooltipField: "code",
            },
            {
                headerName: "End Date",
                field: "endDate",
                filter: true,
                editable: false,
                sortable: true,
                tooltipField: "code",
            },
            {
                headerName: "Total Days",
                field: "totalDays",
                filter: true,
                editable: false,
                sortable: true,
                tooltipField: "code",
            },
        ];
    }

    onGridReady(params): void {
        this.api = params.api;
        this.columnApi = params.columnApi;
        // this.api.sizeColumnsToFit();
    }

    ImportData() {
        const config: any = {
            backdrop: 'static',
            keyboard: false,
            animated: true,
            ignoreBackdropClick: true,
        };

        this.bsModalRef = this.modalService.show(ImportDataComponent, config);

    }
}