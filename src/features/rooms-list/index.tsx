import { Room } from "@prisma/client";
import moment from "jalali-moment";

import {
  AppleIcon,
  BanIcon,
  PrinterIcon,
  BananaIcon,
  CalendarCheck,
  CalendarRangeIcon,
  CalendarSearchIcon,
  CherryIcon,
  CitrusIcon,
  CookieIcon,
  CroissantIcon,
  DoorOpenIcon,
  PersonStandingIcon,
  CastIcon,
  CalendarCheckIcon,
  ExternalLinkIcon,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import { useRoom } from "~/context/room.context";
import { RoomsListSkeleton } from "~/features/rooms-list/loading";
import { RoomStatus } from "~/types";
import Button from "~/ui/buttons";
import ProjectorIcon from "~/ui/icons/projector";
import ToolTip from "~/ui/tooltip";
import { api } from "~/utils/api";

export default function RoomsList({ onClick = (room: Room) => {} }) {
  const getRooms = api.room.getRoomsByCompanyId.useQuery();
  if (getRooms?.isLoading) return <RoomsListSkeleton />;
  if (getRooms?.data?.length <= 0)
    return (
      <div className="flex flex-wrap items-center justify-center  ">
        اتاقی ساخته نشده است
      </div>
    );

  return (
    <div className=" grid gap-5 md:grid-cols-3 ">
      {getRooms.data.map((room, i) => {
        return (
          <>
            <RoomItem
              key={i}
              room={room}
              capicity={room.capacity}
              onClick={(room) => {
                onClick(room);
              }}
            />
            {/* <RoomItem room={room} status="Open" capicity={15} filled={2} />
            <RoomItem room={room} status="Reserved" capicity={6} filled={2} />
            <RoomItem room={room} status="Reserved" capicity={15} filled={15} />
            <RoomItem room={room} status="Reserved" capicity={10} filled={9} />
            <RoomItem room={room} status="Reserved" capicity={7} filled={1} />
            <RoomItem room={room} status="Open" capicity={5} filled={0} />
            <RoomItem room={room} status="Open" capicity={10} filled={5} />
            <RoomItem room={room} status="Open" capicity={10} filled={5} />
            <RoomItem room={room} status="Ocupied" capicity={10} filled={5} />
            <RoomItem room={room} status="Ocupied" capicity={10} filled={5} />
            <RoomItem room={room} status="Reserved" capicity={10} filled={5} />
            <RoomItem room={room} status="Ocupied" capicity={10} filled={5} />
            <RoomItem room={room} status="Open" capicity={10} filled={5} /> */}
          </>
        );
      })}
    </div>
  );
}

function RoomItem({
  room,
  status,
  capicity = 10,
  onClick,
}: {
  room: Room;
  status?: RoomStatus;
  capicity?: number;
  onClick?: (room: Room) => void;
}) {
  return (
    <>
      <div
        onClick={() => {
          onClick(room);
        }}
        className="flex  cursor-pointer flex-col  justify-between gap-5 rounded-xl border border-primary/30 bg-secondary p-5 text-primary backdrop-blur-md transition-colors hover:border-primary"
      >
        <div className="flex items-start justify-between gap-5">
          <div className="flex items-start justify-between gap-5">
            <div className="relative h-10 w-10">
              <Image
                className=" rounded-full p-[2px] ring-1 ring-primary"
                src={"/images/default-door.png"}
                alt=""
                fill
              />
            </div>
            <div className="flex flex-col">
              <h3 className="font-bold">{room.title}</h3>
              <span className="text-sm">{room.description}</span>
            </div>
          </div>
        </div>
        <div className="relative flex flex-row items-start  justify-between gap-2 ">
          <div className="group relative ">
            {/* make parent group relative to work :) */}
            <ToolTip className="flex items-center justify-center gap-2">
              <PersonStandingIcon className={`stroke-accent`} />
              <span> ظرفیت {capicity} تا</span>
            </ToolTip>

            <div className="flex  w-40 flex-wrap items-center  justify-start gap-2">
              {[...Array(Math.min(capicity, 10)).keys()].map((i) => {
                return (
                  <>
                    <PersonStandingIcon key={i} className={`stroke-gray-400`} />
                  </>
                );
              })}
              {capicity > 10 && <span>...</span>}
            </div>
          </div>
          <div className="grid grid-cols-3 items-center justify-end gap-2">
            <PrinterIcon />
            <CastIcon />
            <ProjectorIcon />
          </div>
        </div>
        <div className="flex items-center justify-between">
          <span>{room.price} تومان</span>
          <Button>
            <Link href={`/rooms/${room.id}`}>
              <ExternalLinkIcon />
            </Link>
          </Button>
        </div>
      </div>
    </>
  );
}
